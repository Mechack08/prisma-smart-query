import request from "supertest";
import express, { Request, Response } from "express";
import { describe, it, expect } from "vitest";
import { buildPrismaQueryOptions, PrismaSmartQueryOptions } from "../../src";

// Dummy Prisma-like client for testing
const prisma = {
  user: {
    findMany: (options: any) => {
      // Just return options back so we can assert them
      return Promise.resolve([{ mocked: true, options }]);
    },
  },
};

const app = express();

app.get("/users", async (req: Request, res: Response) => {
  const {
    queryOptions,
    meta: { page, limit },
  } = buildPrismaQueryOptions(req, {}, ["name", "email"]);

  const data = await prisma.user.findMany(queryOptions);

  res.status(200).json({
    status: "success",
    page,
    limit,
    queryOptions,
    data,
  });
});

describe("Integration: Express route with buildPrismaQueryOptions", () => {
  it("applies pagination, search, and sorting correctly", async () => {
    const res = await request(app).get(
      "/users?page=2&limit=5&search=john&sort=-createdAt,name&fields=id,name,email&include=posts"
    );

    expect(res.status).toBe(200);
    expect(res.body.page).toBe(2);
    expect(res.body.limit).toBe(5);

    // Check queryOptions structure
    expect(res.body.queryOptions).toMatchObject({
      orderBy: [{ createdAt: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        email: true,
      },
      //   include: {
      //     posts: true,
      //   },
      skip: 5,
      take: 5,
      where: {
        OR: [
          { name: { contains: "john", mode: "insensitive" } },
          { email: { contains: "john", mode: "insensitive" } },
        ],
      },
    });

    // Ensure dummy prisma call returns mocked data
    expect(res.body.data[0].mocked).toBe(true);
  });

  it("filters by gte operator", async () => {
    const res = await request(app).get("/users?age[gte]=18");

    expect(res.status).toBe(200);
    expect(res.body.queryOptions.where).toEqual({
      age: { gte: 18 },
    });
  });
});

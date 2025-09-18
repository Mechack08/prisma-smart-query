import { describe, it, expect } from "vitest";
import { buildPrismaQueryOptions } from "../../src/index.js";
import { Request } from "express";

function mockRequest(query: Record<string, any>): Request {
  return {
    query,
  } as unknown as Request;
}

describe("buildPrismaQueryOptions", () => {
  it("appplies pagination defaults", () => {
    const req = mockRequest({});
    const {
      meta: { page, limit, skip, take },
    } = buildPrismaQueryOptions(req);

    expect(page).toBe(1);
    expect(limit).toBe(10);
    expect(skip).toBe(0);
    expect(take).toBe(10);
  });

  it("applies custom pagination", () => {
    const req = mockRequest({ page: "2", limit: "5" });
    const {
      meta: { page, limit, skip, take },
    } = buildPrismaQueryOptions(req);

    expect(page).toBe(2);
    expect(limit).toBe(5);
    expect(skip).toBe(5);
    expect(take).toBe(5);
  });

  it("applies sorting", () => {
    const req = mockRequest({ sort: "-createdAt,name" });
    const { queryOptions } = buildPrismaQueryOptions(req);

    expect(queryOptions.orderBy).toEqual([
      { createdAt: "desc" },
      { name: "asc" },
    ]);
  });

  it("applies filters", () => {
    const req = mockRequest({ "age[gte]": "18" });
    const { queryOptions } = buildPrismaQueryOptions(req);

    expect(queryOptions.where).toEqual({
      age: { gte: 18 },
    });
  });

  it("applies search", () => {
    const req = mockRequest({ search: "john" });
    const { queryOptions } = buildPrismaQueryOptions(req, {}, [
      "name",
      "email",
    ]);

    expect(queryOptions.where.OR).toEqual([
      { name: { contains: "john", mode: "insensitive" } },
      { email: { contains: "john", mode: "insensitive" } },
    ]);
  });

  it("applies field selection", () => {
    const req = mockRequest({ fields: "id,name,email" });
    const { queryOptions } = buildPrismaQueryOptions(req);

    expect(queryOptions.select).toEqual({
      id: true,
      name: true,
      email: true,
    });
  });

  it("removes sensitive fields", () => {
    const req = mockRequest({ fields: "id,name,password,email" });
    const { queryOptions } = buildPrismaQueryOptions(req);

    expect(queryOptions.select).toEqual({
      id: true,
      name: true,
      email: true,
    });
  });

  it("applies includes", () => {
    const req = mockRequest({ include: "posts,profile" });
    const { queryOptions } = buildPrismaQueryOptions(req);

    expect(queryOptions.include).toEqual({
      posts: true,
      profile: true,
    });
  });
});

import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { buildPrismaQueryOptions } from "prisma-smart-query";

const prisma = new PrismaClient();
const app = express();

app.get("/products", async (req: Request, res: Response) => {
  // Build query options with pagination + search
  const { queryOptions, page, limit } = buildPrismaQueryOptions(
    req,
    { isActive: true }, // baseWhere
    ["name", "description"], // searchFields
    { defaultSort: { createdAt: "asc" } }
  );

  // Fetch data
  const products = await prisma.product.findMany(queryOptions);
  const total = await prisma.product.count({ where: queryOptions.where });

  res.json({
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: products,
  });
});

app.listen(8000, () => console.log("Server running on http://localhost:8000"));

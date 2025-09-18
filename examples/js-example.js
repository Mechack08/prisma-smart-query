const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { buildPrismaQueryOptions } = require("prisma-smart-query"); // your package

const prisma = new PrismaClient();
const app = express();

app.get("/users", async (req, res) => {
  // Build smart query options
  const { queryOptions, page, limit } = buildPrismaQueryOptions(
    req,
    {},
    ["name", "email"],
    {
      defaultSort: { createdAt: "desc" },
      sensitiveFields: ["password"],
    }
  );

  // Fetch data
  const users = await prisma.user.findMany(queryOptions);
  const total = await prisma.user.count({ where: queryOptions.where });

  res.json({
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    data: users,
  });
});

app.listen(8000, () => console.log("Server running on http://localhost:8000"));

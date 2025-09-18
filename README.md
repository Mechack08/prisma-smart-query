# prisma-smart-query

A **TypeScript-first smart query builder for Prisma** that converts Express.js query parameters into Prisma query options.

✅ Works in **JavaScript** and **TypeScript** projects  
✅ Filtering with operators (`gte`, `lte`, `in`, `contains`, etc.)  
✅ Full-text search across multiple fields  
✅ Sorting (`?sort=-createdAt,name`)  
✅ Pagination (`?page=2&limit=10`)  
✅ Field selection (`?fields=id,name`)  
✅ Relation inclusion (`?include=posts,profile`)  
✅ Auto-removes sensitive fields (like passwords)

---

## 🚀 Installation

```bash
npm install prisma-smart-query
```

## 🟩 Quick Example (JavaScript)

```js
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { buildPrismaQueryOptions } = require("prisma-smart-query");

const prisma = new PrismaClient();
const app = express();

app.get("/users", async (req, res) => {
  const { queryOptions, page, limit } = buildPrismaQueryOptions(
    req,
    {}, // baseWhere
    ["name", "email"], // searchable fields
    {
      defaultSort: { createdAt: "desc" },
      sensitiveFields: ["password"],
    }
  );

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

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
```

## 🟦 Quick Example (TypeScript)

```js
import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { buildPrismaQueryOptions } from "prisma-smart-query";

const prisma = new PrismaClient();
const app = express();

app.get("/products", async (req: Request, res: Response) => {
  const { queryOptions, page, limit } = buildPrismaQueryOptions(
    req,
    { isActive: true }, // baseWhere filter
    ["name", "description"], // searchable fields
    { defaultSort: { createdAt: "asc" } }
  );

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

app.listen(4000, () => console.log("Server running on http://localhost:4000"));
```

## 🔎 Supported Query Parameters

| Param       | Example                       | Description                                                   |
| ----------- | ----------------------------- | ------------------------------------------------------------- |
| **page**    | `?page=2`                     | Current page (default: 1)                                     |
| **limit**   | `?limit=10`                   | Results per page (default: 10)                                |
| **sort**    | `?sort=-createdAt,name`       | Multi-field sorting (`-` = descending)                        |
| **fields**  | `?fields=id,name,email`       | Select specific fields                                        |
| **include** | `?include=posts,profile`      | Include relations                                             |
| **search**  | `?search=john`                | Search across specified fields                                |
| **filters** | `?age[gte]=18&price[lte]=100` | Operator-based filters (`gte`, `lte`, `in`, `contains`, etc.) |

## ✅ Example Queries

GET /users?page=2&limit=5
GET /users?sort=-createdAt,name
GET /users?search=alice
GET /users?age[gte]=18
GET /users?fields=id,name,email&include=posts

## 🧪 Playground Example

Here’s what happens under the hood when you hit an endpoint with query params:

```pgsql
GET /users?page=2&limit=5&sort=-createdAt,name&search=john&age[gte]=18&fields=id,name,email&include=posts
```

### Generated Prisma Query Options

```json
{
  "where": {
    "age": { "gte": 18 },
    "OR": [
      { "name": { "contains": "john", "mode": "insensitive" } },
      { "email": { "contains": "john", "mode": "insensitive" } }
    ]
  },
  "orderBy": [{ "createdAt": "desc" }, { "name": "asc" }],
  "select": {
    "id": true,
    "name": true,
    "email": true,
    "posts": true
  },
  "skip": 5,
  "take": 5
}
```

### Response Example

```json
{
  "meta": {
    "page": 2,
    "limit": 5,
    "total": 42,
    "totalPages": 9
  },
  "data": [
    {
      "id": 6,
      "name": "John Doe",
      "email": "john@example.com",
      "posts": [...]
    },
    ...
  ]
}
```

# Prisma Smart Query

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/prisma-smart-query.svg?color=blue)](https://www.npmjs.com/package/prisma-smart-query)
[![Build Status](https://img.shields.io/github/actions/workflow/status/Mechack08/prisma-smart-query/ci.yml?branch=main)](https://github.com/Mechack08/prisma-smart-query/actions)

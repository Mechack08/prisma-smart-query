import { Request } from "express";

export type PrismaSmartQueryOptions = {
  sensitiveFields?: string[];
  defaultSort?: { [key: string]: "asc" | "desc" };
};

export interface PrismaSmartQueryResult {
  queryOptions: Record<string, any>;
  meta: {
    page: number;
    limit: number;
    skip: number;
    take: number;
    search?: string | null;
    filters: Record<string, any>;
  };
}

export function buildPrismaQueryOptions<T>(
  req: Request,
  baseWhere: Record<string, any> = {},
  searchFields: string[] = [],
  options: PrismaSmartQueryOptions = {}
): PrismaSmartQueryResult {
  const excluded = ["page", "sort", "limit", "fields", "search", "include"];
  const rawQuery = { ...req.query };
  excluded.forEach((f) => delete rawQuery[f]);

  const where: Record<string, any> = { ...baseWhere };

  // Regex for operator filtering
  const opRegex =
    /^(.+?)(?:\[(gte|gt|lte|lt|in|contains|startsWith|endsWith|equals)\]|__(gte|gt|lte|lt|in|contains|startsWith|endsWith|equals)|_+(gte|gt|lte|lt|in|contains|startsWith|endsWith|equals))$/;

  for (const [key, value] of Object.entries(rawQuery)) {
    const m = key.match(opRegex);
    if (m) {
      const field = m[1];
      const op = m[2] || m[3] || m[4];
      let parsed: any = value;

      if (op === "in") {
        parsed = Array.isArray(value) ? value : String(value).split(",");
      } else {
        const num = Number(parsed);
        if (!isNaN(num) && String(parsed) === String(num)) parsed = num;
      }

      if (field.toLowerCase().includes("date")) parsed = new Date(parsed);

      if (!where[field]) where[field] = {};
      where[field][op] = parsed;
    } else {
      let parsed: any = value;
      const num = Number(parsed);
      if (!isNaN(num) && String(parsed) === String(num)) parsed = num;
      if (key.toLowerCase().includes("date")) parsed = new Date(parsed);
      where[key] = parsed;
    }
  }

  // Search
  if (req.query.search && searchFields.length > 0) {
    where.OR = searchFields.map((field) => ({
      [field]: { contains: req.query.search, mode: "insensitive" },
    }));
  }

  const queryOptions: Record<string, any> = { where };

  // Sorting
  if (req.query.sort) {
    queryOptions.orderBy = (req.query.sort as string)
      .split(",")
      .map((s) =>
        s.startsWith("-") ? { [s.substring(1)]: "desc" } : { [s]: "asc" }
      );
  } else if (options.defaultSort) {
    queryOptions.orderBy = [options.defaultSort];
  } else {
    queryOptions.orderBy = [{ createdAt: "desc" }];
  }

  // Field selection
  let select: Record<string, boolean> | null = null;
  if (req.query.fields) {
    const fields = (req.query.fields as string).split(",").map((f) => f.trim());
    select = {};
    fields.forEach((f) => {
      select![f] = true;
    });
  }

  // Relation includes
  if (req.query.include) {
    const includes = (req.query.include as string)
      .split(",")
      .map((f) => f.trim());
    if (select) {
      // merge select + include
      select = {
        ...select,
        ...Object.fromEntries(includes.map((r) => [r, true])),
      };
    } else {
      queryOptions.include = {};
      includes.forEach((relation) => {
        queryOptions.include[relation] = true;
      });
    }
  }

  // Exclude sensitive fields
  const sensitiveFields = options.sensitiveFields || [
    "password",
    "hashedPassword",
    "resetToken",
  ];
  if (select) {
    sensitiveFields.forEach((field) => {
      if (select![field]) delete select![field];
    });
    queryOptions.select = select;
  }

  // Pagination
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string, 10) || 10);
  queryOptions.skip = (page - 1) * limit;
  queryOptions.take = limit;

  return {
    queryOptions,
    meta: {
      page,
      limit,
      skip: queryOptions.skip,
      take: queryOptions.take,
      search: req.query.search ? String(req.query.search) : null,
      filters: where,
    },
  };
}

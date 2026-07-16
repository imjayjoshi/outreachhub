import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../shared/utils/apiResponse.js";

// Schema for creating a company
export const companyCreateSchema = z.object({
  companyName: z.string().trim().min(1, "Company Name is required"),
  email: z
    .string()
    .trim()
    .email("Invalid email format")
    .nullable()
    .optional()
    .or(z.literal("")),
  phone: z.string().trim().nullable().optional(),
  careerUrl: z
    .string()
    .trim()
    .url("Invalid career page URL")
    .nullable()
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .trim()
    .url("Invalid website URL")
    .nullable()
    .optional()
    .or(z.literal("")),
  linkedin: z.string().trim().nullable().optional(),
  industry: z.string().trim().nullable().optional(),
  description: z.string().trim().nullable().optional(),
  city: z.string().trim().nullable().optional(),
  state: z.string().trim().nullable().optional(),
  country: z.string().trim().nullable().optional(),
  employeeSize: z.string().trim().nullable().optional(),
  status: z.enum(["active", "archived"]).optional(),
  source: z.string().optional(),
});

// Schema for updating a company (partial)
export const companyUpdateSchema = companyCreateSchema.partial();

// Schema for listing query parameters
export const companyListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  sortField: z.string().optional(),
  sortOrder: z.enum(["ASC", "DESC"]).optional().default("DESC"),
  importedToday: z
    .preprocess((val) => val === "true" || val === true, z.boolean())
    .optional(),
  importedThisWeek: z
    .preprocess((val) => val === "true" || val === true, z.boolean())
    .optional(),
  hasEmail: z
    .preprocess((val) => val === "true" || val === true, z.boolean())
    .optional(),
  hasWebsite: z
    .preprocess((val) => val === "true" || val === true, z.boolean())
    .optional(),
  hasCareerPage: z
    .preprocess((val) => val === "true" || val === true, z.boolean())
    .optional(),
  missingDetails: z
    .preprocess((val) => val === "true" || val === true, z.boolean())
    .optional(),
  status: z.string().optional(),
});

// Schema for spreadsheet import preview
export const importPreviewSchema = z.object({
  fileData: z.string().min(1, "fileData Base64 string is required"),
  filename: z.string().min(1, "filename is required"),
});

// Schema for spreadsheet import confirm
export const importConfirmSchema = z.object({
  fileData: z.string().min(1, "fileData Base64 string is required"),
  filename: z.string().min(1, "filename is required"),
  mappings: z.record(z.string(), z.string()),
});

// Schema for bulk operations (archive, delete)
export const bulkActionSchema = z.object({
  ids: z.array(z.string()).min(1, "At least one ID must be provided"),
});

// Schema for generate details (placeholder)
export const generateDetailsSchema = z.object({
  ids: z.array(z.string()).min(1, "At least one ID must be provided"),
});

/**
 * Express Middleware helper to validate request body
 */
export function validateBody(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errorMsg = result.error.issues
        .map((e: any) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      return ApiResponse.failure(
        res,
        `Validation Error: ${errorMsg}`,
        result.error.format(),
        400,
      );
    }
    req.body = result.data;
    next();
  };
}

/**
 * Express Middleware helper to validate request query parameters
 */
export function validateQuery(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const errorMsg = result.error.issues
        .map((e: any) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      return ApiResponse.failure(
        res,
        `Query Validation Error: ${errorMsg}`,
        result.error.format(),
        400,
      );
    }
    req.query = result.data as any;
    next();
  };
}

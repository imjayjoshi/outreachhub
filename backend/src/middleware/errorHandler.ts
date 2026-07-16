import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../modules/shared/utils/apiResponse.js";
import { Logger } from "../modules/shared/utils/logger.js";

/**
 * Centralized Error Handling Middleware for Express.
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const method = req.method;
  const url = req.originalUrl || req.url;

  Logger.error(`[errorHandler] Exception caught on ${method} ${url}:`, err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "An unexpected error occurred.";

  return ApiResponse.failure(
    res,
    message,
    process.env.NODE_ENV === "development" ? err : undefined,
    statusCode,
  );
}

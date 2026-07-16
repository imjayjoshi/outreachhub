import { Response, NextFunction } from "express";
import { JwtService } from "../google/jwt.service.js";
import { AuthenticatedRequest } from "@/middleware/auth.js";
import { ApiResponse } from "@/modules/shared/utils/apiResponse.js";

const jwtService = new JwtService();

/**
 * Middleware to enforce authentication via CareerFlow JWT.
 */
export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return ApiResponse.failure(res, "Unauthorized access", null, 401);
  }

  try {
    const decoded = jwtService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return ApiResponse.failure(res, "Unauthorized access", null, 401);
  }
}

import { Request, Response, NextFunction } from "express";
import { requireAuth as requireAuthFromModule } from "../modules/auth/middleware/auth.middleware.js";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      name?: string | null;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user?: Express.User;
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  return requireAuthFromModule(req, res, next);
}

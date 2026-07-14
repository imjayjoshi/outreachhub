import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string | null;
  };
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const secret =
      process.env.JWT_SECRET ||
      process.env.AUTH_SECRET ||
      "default_auth_secret_key_123";
    const decoded = jwt.verify(token, secret) as {
      id: string;
      email: string;
      name?: string | null;
    };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

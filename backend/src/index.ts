import "reflect-metadata";
import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { initDataSource } from "@/modules/shared/database/dataSource.js";
import coreRouter from "@/core/api/index.js";
import { initPassport } from "@/modules/auth/config/passport.js";
import googleAuthRouter from "@/modules/auth/google/google.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Initialize Passport
const passportInstance = initPassport();
app.use(passportInstance.initialize());

// Mount Google OAuth routes directly under /api/auth to match Google redirect URIs
app.use("/api/auth/google", googleAuthRouter);

// Mount all API routes through the centralized core router
// To add new endpoints — edit src/core/api/index.ts, not this file.
app.use("/api/v1", coreRouter);

// Centralized error handler catches any async exceptions thrown in routes
app.use(errorHandler);

// 404 fallback
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "API route not found" });
});

// Boot: connect DB first, then start HTTP server
initDataSource()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[server] Express backend listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("[server] Failed to connect to database:", err);
    process.exit(1);
  });

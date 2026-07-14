import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRouter from "./routes/auth";
import companiesRouter from "./routes/companies";
import contactsRouter from "./routes/contacts";
import leadsRouter from "./routes/leads";
import templatesRouter from "./routes/templates";

dotenv.config();

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

// Define routes
app.use("/api/auth", authRouter);
app.use("/api/companies", companiesRouter);
app.use("/api/contacts", contactsRouter);
app.use("/api/leads", leadsRouter);
app.use("/api/templates", templatesRouter);

// Error fallback handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "API route not found" });
});

app.listen(PORT, () => {
  console.log(`[server] Express backend listening on port ${PORT}`);
});

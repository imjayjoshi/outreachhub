/**
 * Core API Router
 * ─────────────────────────────────────────────────────────────────────────────
 * Single mount point for every API endpoint in the application.
 * All routes are centrally registered here and mounted under a shared prefix
 * in src/index.ts.
 *
 * Convention
 *   /api/auth/*       — authentication (register, login, logout, me)
 *   /api/companies/*  — company CRUD + CSV import
 *   /api/contacts/*   — contact CRUD
 *   /api/leads/*      — lead listing + filters
 *   /api/templates/*  — email template CRUD
 *
 * To add a new feature:
 *   1. Create src/core/api/<feature>.ts
 *   2. Import and register it here with a descriptive path
 *   3. That's it — no changes needed in src/index.ts
 */

import { Router } from "express";
import authRouter from "./auth.js";
import companyRouter from "../../modules/company/company.routes.js";
import contactsRouter from "./contacts.js";
import leadsRouter from "./leads.js";
import templatesRouter from "./templates.js";

const coreRouter = Router();

coreRouter.use("/auth", authRouter);
coreRouter.use("/company", companyRouter);
coreRouter.use("/companies", companyRouter);
coreRouter.use("/contacts", contactsRouter);
coreRouter.use("/leads", leadsRouter);
coreRouter.use("/templates", templatesRouter);

export default coreRouter;

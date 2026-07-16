import { Router } from "express";
import { requireAuth } from "@/middleware/auth.js";
import { CompanyController } from "./company.controller.js";
import {
  validateBody,
  validateQuery,
  companyCreateSchema,
  companyUpdateSchema,
  companyListQuerySchema,
  importPreviewSchema,
  importConfirmSchema,
  bulkActionSchema,
  generateDetailsSchema,
} from "./company.validation.js";

const router = Router();
const controller = new CompanyController();

// Require authorization for all company endpoints
router.use(requireAuth);

// Import Wizard endpoints
router.post(
  "/import/preview",
  validateBody(importPreviewSchema),
  controller.previewImport,
);
router.post(
  "/import/confirm",
  validateBody(importConfirmSchema),
  controller.confirmImport,
);
router.get("/import/history", controller.getImportHistory);
router.get("/import/history/:batchId", controller.getImportBatchDetails);

// Bulk operations
router.post(
  "/bulk-delete",
  validateBody(bulkActionSchema),
  controller.bulkDelete,
);
router.post(
  "/bulk-archive",
  validateBody(bulkActionSchema),
  controller.bulkArchive,
);
router.post(
  "/generate-details",
  validateBody(generateDetailsSchema),
  controller.generateDetails,
);

// Standard CRUD endpoints
router.get("/", validateQuery(companyListQuerySchema), controller.list);
router.get("/:id", controller.get);
router.post("/", validateBody(companyCreateSchema), controller.create);
router.put("/:id", validateBody(companyUpdateSchema), controller.update);
router.delete("/:id", controller.delete);

export default router;

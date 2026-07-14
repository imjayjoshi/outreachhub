import { Router, Response } from "express";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";
import {
  listTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "@/modules/templates/queries/templateQueries";

const router = Router();

// Apply authentication to all template routes
router.use(requireAuth);

// GET /
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await listTemplates(req.user!.id);
    return res.json(data);
  } catch (err) {
    console.error("List templates error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /
router.post("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const template = await createTemplate(req.user!.id, req.body);
    return res.status(201).json(template);
  } catch (err) {
    console.error("Create template error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /:id
router.get("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const template = await getTemplate(req.user!.id, req.params.id);
    if (!template) {
      return res.status(404).json({ error: "Not found" });
    }
    return res.json(template);
  } catch (err) {
    console.error("Get template error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /:id
router.patch("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await updateTemplate(req.params.id, req.body);
    return res.json(updated);
  } catch (err) {
    console.error("Update template error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /:id
router.delete("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    await deleteTemplate(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    console.error("Delete template error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

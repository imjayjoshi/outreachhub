import { Router, Response } from "express";
import { requireAuth, AuthenticatedRequest } from "@/middleware/auth.js";
import {
  listContacts,
  createContact,
  getContact,
  updateContact,
  deleteContact,
} from "@/modules/contacts/queries/contactQueries.js";

const router = Router();

// Apply authentication to all contact routes
router.use(requireAuth);

// GET /
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await listContacts(req.user!.id);
    return res.json(data);
  } catch (err) {
    console.error("List contacts error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /
router.post("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const contact = await createContact(req.user!.id, req.body);
    return res.status(201).json(contact);
  } catch (err) {
    console.error("Create contact error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /:id
router.get("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const contact = await getContact(req.user!.id, req.params.id);
    if (!contact) {
      return res.status(404).json({ error: "Not found" });
    }
    return res.json(contact);
  } catch (err) {
    console.error("Get contact error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /:id
router.patch("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await updateContact(req.params.id, req.body);
    return res.json(updated);
  } catch (err) {
    console.error("Update contact error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /:id
router.delete("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    await deleteContact(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    console.error("Delete contact error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

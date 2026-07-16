import { Router, Response } from "express";
import { requireAuth, AuthenticatedRequest } from "@/middleware/auth.js";
import { listLeads } from "@/modules/leads/queries/leadQueries.js";

const router = Router();

// Apply authentication to all lead routes
router.use(requireAuth);

// GET /
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const city = (req.query.city as string) || undefined;
    const status = (req.query.status as string) || undefined;
    const emailOnly = req.query.emailOnly === "true";

    const leads = await listLeads(req.user!.id, { city, status, emailOnly });
    return res.json(leads);
  } catch (err) {
    console.error("List leads error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

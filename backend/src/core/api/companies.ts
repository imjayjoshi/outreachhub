import { Router, Response } from "express";
import { requireAuth, AuthenticatedRequest } from "@/middleware/auth.js";
import {
  listCompanies,
  createCompany,
  getCompany,
  updateCompany,
  deleteCompany,
} from "@/modules/companies/queries/companyQueries.js";
import { AppDataSource } from "@/modules/shared/database/dataSource.js";
import { Company } from "@/modules/shared/database/entities/company.entity.js";
import { Contact } from "@/modules/shared/database/entities/contact.entity.js";

const router = Router();

interface ImportRow {
  companyName: string;
  website?: string;
  location?: string;
  industry?: string;
  contactName: string;
  email: string;
  role?: string;
  phone?: string;
}

// Apply authentication to all company routes
router.use(requireAuth);

// GET /
router.get("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const data = await listCompanies(req.user!.id);
    return res.json(data);
  } catch (err) {
    console.error("List companies error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /
router.post("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const company = await createCompany(req.user!.id, req.body);
    return res.status(201).json(company);
  } catch (err) {
    console.error("Create company error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /import
router.post("/import", async (req: AuthenticatedRequest, res: Response) => {
  const { nanoid } = await import("nanoid");
  try {
    const { rows } = req.body as { rows: ImportRow[] };
    if (!rows || !Array.isArray(rows)) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    let importedCount = 0;
    const userId = req.user!.id;
    const companyRepo = AppDataSource.getRepository(Company);
    const contactRepo = AppDataSource.getRepository(Contact);

    for (const row of rows) {
      if (!row.companyName || !row.email) continue;

      // 1. Find or create company
      let company = await companyRepo
        .createQueryBuilder("company")
        .where("company.userId = :userId", { userId })
        .andWhere("LOWER(company.name) = LOWER(:name)", {
          name: row.companyName,
        })
        .getOne();

      if (!company) {
        company = companyRepo.create({
          id: nanoid(),
          userId,
          name: row.companyName,
          website: row.website || null,
          location: row.location || null,
          industry: row.industry || null,
        });
        await companyRepo.save(company);
      }

      // 2. Find or create contact
      const contactExists = await contactRepo
        .createQueryBuilder("contact")
        .where("contact.userId = :userId", { userId })
        .andWhere("LOWER(contact.email) = LOWER(:email)", { email: row.email })
        .andWhere("contact.companyId = :companyId", { companyId: company.id })
        .getOne();

      if (!contactExists) {
        const contact = contactRepo.create({
          id: nanoid(),
          userId,
          companyId: company.id,
          name: row.contactName || "Unknown",
          email: row.email,
          role: row.role || null,
          phone: row.phone || null,
        });
        await contactRepo.save(contact);
        importedCount++;
      }
    }

    return res.json({ success: true, imported: importedCount });
  } catch (err) {
    console.error("Import error:", err);
    return res.status(500).json({ error: "Import failed" });
  }
});

// GET /:id
router.get("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const company = await getCompany(req.user!.id, req.params.id);
    if (!company) {
      return res.status(404).json({ error: "Not found" });
    }
    return res.json(company);
  } catch (err) {
    console.error("Get company error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /:id
router.patch("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = await updateCompany(req.params.id, req.body);
    return res.json(updated);
  } catch (err) {
    console.error("Update company error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /:id
router.delete("/:id", async (req: AuthenticatedRequest, res: Response) => {
  try {
    await deleteCompany(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    console.error("Delete company error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

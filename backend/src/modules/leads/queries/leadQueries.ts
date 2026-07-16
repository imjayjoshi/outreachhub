import { AppDataSource } from "@/modules/shared/database/dataSource.js";
import { Lead } from "@/modules/shared/database/entities/lead.entity.js";
import { IsNull, Not, FindOptionsWhere } from "typeorm";

function repo() {
  return AppDataSource.getRepository(Lead);
}

export interface LeadCreateInput {
  name: string;
  website: string;
  city: string;
  state?: string;
  industry?: string;
  email?: string | null;
  source: string;
  status?: string;
}

export async function websiteExists(website: string): Promise<boolean> {
  const lead = await repo().findOne({
    where: { website: website.toLowerCase().trim() },
    select: ["id"],
  });
  return lead !== null;
}

export async function insertLead(userId: string, data: LeadCreateInput) {
  const { nanoid } = await import("nanoid");
  const lead = repo().create({
    id: nanoid(),
    userId,
    name: data.name,
    website: data.website.toLowerCase().trim(),
    city: data.city,
    state: data.state,
    industry: data.industry ?? "IT",
    email: data.email ?? null,
    source: data.source,
    status: data.status ?? (data.email ? "new" : "email_not_found"),
  });
  return repo().save(lead);
}

export async function listLeads(
  userId: string,
  filters?: {
    city?: string;
    status?: string;
    emailOnly?: boolean;
  },
) {
  const where: FindOptionsWhere<Lead> = { userId };
  if (filters?.city) where.city = filters.city;
  if (filters?.status) where.status = filters.status;
  if (filters?.emailOnly) where.email = Not(IsNull());

  return repo().find({
    where,
    order: { createdAt: "DESC" },
  });
}

export async function updateLeadStatus(id: string, status: string) {
  await repo().update({ id }, { status });
  return repo().findOneBy({ id });
}

export async function markMailSent(id: string) {
  await repo().update({ id }, { mailSent: true, status: "mailed" });
  return repo().findOneBy({ id });
}

export async function markFollowUpSent(id: string) {
  await repo().update({ id }, { followUpSent: true, status: "followup" });
  return repo().findOneBy({ id });
}

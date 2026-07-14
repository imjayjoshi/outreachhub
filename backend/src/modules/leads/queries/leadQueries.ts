import { prisma } from "@/modules/shared/database/prisma";

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
  const lead = await prisma.lead.findUnique({
    where: { website: website.toLowerCase().trim() },
    select: { id: true },
  });
  return lead !== null;
}

export async function insertLead(userId: string, data: LeadCreateInput) {
  return prisma.lead.create({
    data: {
      userId,
      name: data.name,
      website: data.website.toLowerCase().trim(),
      city: data.city,
      state: data.state,
      industry: data.industry ?? "IT",
      email: data.email ?? null,
      source: data.source,
      status: data.status ?? (data.email ? "new" : "email_not_found"),
    },
  });
}

export async function listLeads(
  userId: string,
  filters?: {
    city?: string;
    status?: string;
    emailOnly?: boolean;
  },
) {
  return prisma.lead.findMany({
    where: {
      userId,
      ...(filters?.city ? { city: filters.city } : {}),
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.emailOnly ? { email: { not: null } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateLeadStatus(id: string, status: string) {
  return prisma.lead.update({ where: { id }, data: { status } });
}

export async function markMailSent(id: string) {
  return prisma.lead.update({
    where: { id },
    data: { mailSent: true, status: "mailed" },
  });
}

export async function markFollowUpSent(id: string) {
  return prisma.lead.update({
    where: { id },
    data: { followUpSent: true, status: "followup" },
  });
}

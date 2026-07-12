import "server-only";
import { prisma } from "@/modules/shared/database/prisma";

export interface CompanyCreateInput {
  name: string;
  website?: string | null;
  industry?: string | null;
  size?: string | null;
  location?: string | null;
  notes?: string | null;
}

export type CompanyUpdateInput = Partial<CompanyCreateInput>;

export async function listCompanies(userId: string) {
  return prisma.company.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getCompany(userId: string, id: string) {
  return prisma.company.findFirst({
    where: { id, userId },
    include: { contacts: true },
  });
}

export async function createCompany(userId: string, data: CompanyCreateInput) {
  return prisma.company.create({ data: { ...data, userId } });
}

export async function updateCompany(id: string, data: CompanyUpdateInput) {
  return prisma.company.update({ where: { id }, data });
}

export async function deleteCompany(id: string) {
  return prisma.company.delete({ where: { id } });
}

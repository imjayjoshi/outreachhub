import { AppDataSource } from "@/modules/shared/database/dataSource.js";
import { Company } from "@/modules/shared/database/entities/company.entity.js";

function repo() {
  return AppDataSource.getRepository(Company);
}

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
  return repo().find({
    where: { createdBy: userId },
    order: { createdAt: "DESC" },
  });
}

export async function getCompany(userId: string, id: string) {
  return repo().findOne({
    where: { id, createdBy: userId },
    relations: { contacts: true },
  });
}

export async function createCompany(userId: string, data: CompanyCreateInput) {
  const { nanoid } = await import("nanoid");
  const company = repo().create({
    ...data,
    createdBy: userId,
    id: nanoid(),
  } as any);
  return repo().save(company);
}

export async function updateCompany(id: string, data: CompanyUpdateInput) {
  await repo().update({ id }, data as Partial<Company>);
  return repo().findOneBy({ id });
}

export async function deleteCompany(id: string) {
  return repo().delete({ id });
}

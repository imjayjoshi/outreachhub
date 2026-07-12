import "server-only";
import { prisma } from "@/modules/shared/database/prisma";

export interface ContactCreateInput {
  name: string;
  email: string;
  phone?: string | null;
  role?: string | null;
  linkedinUrl?: string | null;
  companyId?: string | null;
  status?: string;
}

export type ContactUpdateInput = Partial<ContactCreateInput>;

export async function listContacts(userId: string) {
  return prisma.contact.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { company: { select: { id: true, name: true } } },
  });
}

export async function getContact(userId: string, id: string) {
  return prisma.contact.findFirst({
    where: { id, userId },
    include: { company: { select: { id: true, name: true } } },
  });
}

export async function createContact(userId: string, data: ContactCreateInput) {
  return prisma.contact.create({ data: { ...data, userId } });
}

export async function updateContact(id: string, data: ContactUpdateInput) {
  return prisma.contact.update({ where: { id }, data });
}

export async function deleteContact(id: string) {
  return prisma.contact.delete({ where: { id } });
}

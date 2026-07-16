import { AppDataSource } from "@/modules/shared/database/dataSource.js";
import { Contact } from "@/modules/shared/database/entities/contact.entity.js";

function repo() {
  return AppDataSource.getRepository(Contact);
}

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
  return repo().find({
    where: { userId },
    relations: { company: true },
    order: { createdAt: "DESC" },
  });
}

export async function getContact(userId: string, id: string) {
  return repo().findOne({
    where: { id, userId },
    relations: { company: true },
  });
}

export async function createContact(userId: string, data: ContactCreateInput) {
  const { nanoid } = await import("nanoid");
  const contact = repo().create({ ...data, userId, id: nanoid() });
  return repo().save(contact);
}

export async function updateContact(id: string, data: ContactUpdateInput) {
  await repo().update({ id }, data as Partial<Contact>);
  return repo().findOneBy({ id });
}

export async function deleteContact(id: string) {
  return repo().delete({ id });
}

import { AppDataSource } from "@/modules/shared/database/dataSource.js";
import { Template } from "@/modules/shared/database/entities/template.entity.js";

function repo() {
  return AppDataSource.getRepository(Template);
}

export interface TemplateCreateInput {
  name: string;
  subject: string;
  body: string;
  variables?: object | null;
}

export type TemplateUpdateInput = Partial<TemplateCreateInput>;

export async function listTemplates(userId: string) {
  return repo().find({
    where: { userId },
    order: { createdAt: "DESC" },
  });
}

export async function getTemplate(userId: string, id: string) {
  return repo().findOne({ where: { id, userId } });
}

export async function createTemplate(
  userId: string,
  data: TemplateCreateInput,
) {
  const { nanoid } = await import("nanoid");
  const template = repo().create({ ...data, userId, id: nanoid() });
  return repo().save(template);
}

export async function updateTemplate(id: string, data: TemplateUpdateInput) {
  await repo().update({ id }, data as Partial<Template>);
  return repo().findOneBy({ id });
}

export async function deleteTemplate(id: string) {
  return repo().delete({ id });
}

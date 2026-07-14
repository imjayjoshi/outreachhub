import { prisma } from "@/modules/shared/database/prisma";
import { Prisma } from "@prisma/client";

export interface TemplateCreateInput {
  name: string;
  subject: string;
  body: string;
  variables?: Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue;
}

export type TemplateUpdateInput = Partial<TemplateCreateInput>;

export async function listTemplates(userId: string) {
  return prisma.template.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTemplate(userId: string, id: string) {
  return prisma.template.findFirst({ where: { id, userId } });
}

export async function createTemplate(
  userId: string,
  data: TemplateCreateInput,
) {
  return prisma.template.create({ data: { ...data, userId } });
}

export async function updateTemplate(id: string, data: TemplateUpdateInput) {
  return prisma.template.update({ where: { id }, data });
}

export async function deleteTemplate(id: string) {
  return prisma.template.delete({ where: { id } });
}

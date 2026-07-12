import { apiClient } from "@/modules/shared";

export const templateService = {
  list: () => apiClient.get("/templates").then((r) => r.data),
  get: (id: string) => apiClient.get(`/templates/${id}`).then((r) => r.data),
  create: (data: unknown) =>
    apiClient.post("/templates", data).then((r) => r.data),
  update: (id: string, data: unknown) =>
    apiClient.patch(`/templates/${id}`, data).then((r) => r.data),
  remove: (id: string) =>
    apiClient.delete(`/templates/${id}`).then((r) => r.data),
};

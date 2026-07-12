import { apiClient } from "@/modules/shared";

export const contactService = {
  list: () => apiClient.get("/contacts").then((r) => r.data),
  get: (id: string) => apiClient.get(`/contacts/${id}`).then((r) => r.data),
  create: (data: unknown) =>
    apiClient.post("/contacts", data).then((r) => r.data),
  update: (id: string, data: unknown) =>
    apiClient.patch(`/contacts/${id}`, data).then((r) => r.data),
  remove: (id: string) =>
    apiClient.delete(`/contacts/${id}`).then((r) => r.data),
};

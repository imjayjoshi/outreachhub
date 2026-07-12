import { apiClient } from "@/modules/shared";

export const companyService = {
  list: () => apiClient.get("/companies").then((r) => r.data),
  get: (id: string) => apiClient.get(`/companies/${id}`).then((r) => r.data),
  create: (data: unknown) =>
    apiClient.post("/companies", data).then((r) => r.data),
  update: (id: string, data: unknown) =>
    apiClient.patch(`/companies/${id}`, data).then((r) => r.data),
  remove: (id: string) =>
    apiClient.delete(`/companies/${id}`).then((r) => r.data),
};

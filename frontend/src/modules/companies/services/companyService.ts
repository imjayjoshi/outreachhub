import { apiClient } from "@/modules/shared";

export interface CompanyListResponse {
  success: boolean;
  message: string;
  data: {
    list: unknown[];
    total: number;
    page: number;
    limit: number;
  };
}

export const companyService = {
  // Query companies with pagination/filtering
  list: (params?: Record<string, unknown>) =>
    apiClient
      .get<CompanyListResponse>("/company", { params })
      .then((r) => r.data),

  // Single CRUD
  get: (id: string) => apiClient.get("/company/" + id).then((r) => r.data),

  create: (data: unknown) =>
    apiClient.post("/company", data).then((r) => r.data),

  update: (id: string, data: unknown) =>
    apiClient.put("/company/" + id, data).then((r) => r.data),

  remove: (id: string) =>
    apiClient.delete("/company/" + id).then((r) => r.data),

  // Bulk Operations
  bulkDelete: (ids: string[]) =>
    apiClient.post("/company/bulk-delete", { ids }).then((r) => r.data),

  bulkArchive: (ids: string[]) =>
    apiClient.post("/company/bulk-archive", { ids }).then((r) => r.data),

  generateDetails: (ids: string[]) =>
    apiClient.post("/company/generate-details", { ids }).then((r) => r.data),

  // Import Wizard APIs
  previewImport: (fileData: string, filename: string) =>
    apiClient
      .post("/company/import/preview", { fileData, filename })
      .then((r) => r.data),

  confirmImport: (
    fileData: string,
    filename: string,
    mappings: Record<string, string>,
  ) =>
    apiClient
      .post("/company/import/confirm", { fileData, filename, mappings })
      .then((r) => r.data),

  getImportHistory: () =>
    apiClient.get("/company/import/history").then((r) => r.data),

  getImportBatchDetails: (batchId: string) =>
    apiClient.get("/company/import/history/" + batchId).then((r) => r.data),
};

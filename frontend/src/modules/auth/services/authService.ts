import { apiClient } from "@/modules/shared";

export const authService = {
  login: (data: unknown) =>
    apiClient.post("/auth/login", data).then((r) => r.data),
  logout: () => apiClient.post("/auth/logout").then((r) => r.data),
  me: () => apiClient.get("/auth/me").then((r) => r.data),
};

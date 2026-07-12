import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 seconds timeout
});

// Request Interceptor: Attach headers or authorization tokens globally
apiClient.interceptors.request.use(
  (config) => {
    // You can dynamically read tokens or session parameters from localStorage/sessionStorage here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor: Centralized error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Global handling for common status codes
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        // Automatically handle unauthorized errors (e.g., redirect to login or clear cache)
        console.warn(
          "API request returned 401 Unauthorized. Redirecting or clearing state...",
        );
      } else if (status === 403) {
        console.error(
          "API request returned 403 Forbidden. Access is restricted.",
        );
      } else if (status >= 500) {
        console.error("Internal Server Error occurred on the API backend.");
      }
    } else {
      console.error(
        "Network or connection error. Please verify client connectivity.",
      );
    }
    return Promise.reject(error);
  },
);

export default apiClient;

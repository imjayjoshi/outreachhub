import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Send cookies with cross-origin requests
  timeout: 10000, // 10 seconds timeout
});

// Request Interceptor: Attach headers or authorization tokens globally
apiClient.interceptors.request.use(
  (config) => {
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
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    // Global handling for common status codes
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
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

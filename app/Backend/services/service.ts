import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Log before request
apiClient.interceptors.request.use((config) => {
  console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Handle response
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      status: response.status,
    });
    return response.data;
  },
  async (error) => {
    if (error.response?.status === 401 && !error.config.url?.includes("/auth/refresh")) {
      try {
        await apiClient.post("/auth/refresh");
        console.log("[API] Token refreshed successfully");
        return apiClient(error.config); // Retry the original request
      } catch (refreshError) {
        console.error("[API] Token refresh failed");
        throw new Error("Please log in again");
      }
    }
    const message = error.response?.data?.message || error.message || "Request failed";
    console.error(`[API Error] ${error.config?.url}: ${message}`);
    throw new Error(message);
  }
);

export default apiClient;
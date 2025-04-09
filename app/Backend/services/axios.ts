import axios, { AxiosError, AxiosInstance, AxiosResponse } from "axios";

const apiClient: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      try {
        await apiClient.post("/auth/refresh");
        if (error.config) {
          return apiClient(error.config);
        }
        return Promise.reject(new Error("Request configuration is missing"));
      } catch (refreshError) {
        return Promise.reject(new Error("Session expired, please log in again"));
      }
    }
    const message = (error.response?.data as { error?: string })?.error || error.message || "Request failed";
    return Promise.reject(new Error(message));
  }
);

interface UserData {
  username: string;
  email: string;
  password?: string;
  newPassword?: string;
  profilePic?: string;
}

interface UserResponse {
  message: string;
  user: { id?: string; username: string; email: string; profilePic?: string };
}

interface UploadResponse {
  success: boolean;
  imageUrls?: string[];
  filecount?: number;
  error?: string;
}

interface SharedFilesResponse {
  success: boolean;
  files: { url: string; filename: string; date: string }[];
  error?: string;
}

export const api = {
  getUser: async (): Promise<UserResponse> => {
    return apiClient.get("/auth/user");
  },

  updateUser: async (data: UserData): Promise<UserResponse> => {
    return apiClient.put("/auth/user", data);
  },

  signup: async (data: { username: string; email: string; password: string }): Promise<UserResponse> => {
    return apiClient.post("/auth/signup", data);
  },

  signin: async (usernameOrEmail: string, password: string): Promise<UserResponse> => {
    return apiClient.post("/auth/signin", { usernameOrEmail, password });
  },

  uploadFiles: async (formData: FormData): Promise<UploadResponse> => {
    return apiClient.post("/auth/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 30000,
    });
  },

  fetchSharedFiles: async (): Promise<SharedFilesResponse> => {
    return apiClient.get("/auth/shared-files");
  },

  deleteSharedFile: async (url: string): Promise<{ success: boolean; error?: string }> => {
    return apiClient.delete(`/auth/shared-files/${encodeURIComponent(url)}`);
  },

  updateSharedFileName: async (
    url: string,
    newFilename: string
  ): Promise<{ success: boolean; error?: string }> => {
    return apiClient.put(`/auth/shared-files/${encodeURIComponent(url)}`, { filename: newFilename });
  },
};

export default apiClient;
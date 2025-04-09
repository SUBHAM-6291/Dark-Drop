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
  (error: AxiosError) => {
    const message = (error.response?.data as { error?: string })?.error || error.message || "Request failed";
    return Promise.reject(new Error(message));
  }
);

interface UserData {
  username: string;
  email: string;
  password?: string; // Current password
  newPassword?: string;
  profilePic?: string;
}

interface UserResponse {
  message: string;
  user: { id?: string; username: string; email: string; profilePic?: string }; // id optional as backend doesn’t return it
}

interface UploadResponse {
  success: boolean;
  urls?: string[];
  filecount?: number;
  error?: string;
}

interface SharedFilesResponse {
  success: boolean;
  files: { url: string; filename: string; date: string }[];
  error?: string;
}

export const api = {
  getUser: async (email: string): Promise<UserResponse> => {
    return apiClient.get("/user", { params: { email } }); // Updated to include email query param
  },

  updateUser: async (data: FormData): Promise<UserResponse> => {
    return apiClient.post("/user", data, { // Updated to POST /api/user
      headers: { "Content-Type": "multipart/form-data" },
    });
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
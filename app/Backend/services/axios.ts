import apiClient from "./service";
import {
  UserResponse,
  UserData,
  UploadResponse,
  SharedFilesResponse,
  AvailabilityResponse,
} from "./types";

export const apiService = {
  getUser: async (): Promise<UserResponse> => {
    return apiClient.get("/auth/user");
  },

  updateUser: async (data: UserData): Promise<UserResponse> => {
    return apiClient.put("/auth/user", data);
  },

  logout: async () => {
    console.log("[apiService] Initiating logout");
    try {
      const response = await apiClient.post("/auth/signout");
      console.log("[apiService] Logout response:", response);
      return response;
    } catch (error) {
      console.error("[apiService] Logout error:", error);
      throw error;
    }
  },

  signup: async (data: {
    username: string;
    email: string;
    password: string;
  }): Promise<UserResponse> => {
    return apiClient.post("/auth/signup", data);
  },

  signin: async (
    usernameOrEmail: string,
    password: string
  ): Promise<UserResponse> => {
    return apiClient.post("/auth/signin", { usernameOrEmail, password });
  },

  uploadFiles: async (formData: FormData): Promise<UploadResponse> => {
    return apiClient.post("/auth/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 40000,
    });
  },

  fetchSharedFiles: async (): Promise<SharedFilesResponse> => {
    return apiClient.get("/auth/shared-files");
  },

  deleteSharedFile: async (
    url: string
  ): Promise<{ success: boolean; error?: string }> => {
    return apiClient.delete(`/auth/shared-files/${encodeURIComponent(url)}`);
  },

  updateSharedFileName: async (
    url: string,
    newFilename: string
  ): Promise<{ success: boolean; error?: string }> => {
    return apiClient.put(`/auth/shared-files/${encodeURIComponent(url)}`, {
      filename: newFilename,
    });
  },

  checkAvailability: async (data: {
    username?: string;
    email?: string;
  }): Promise<AvailabilityResponse> => {
    return apiClient.post("/auth/check-availability", data);
  },
};
import axios, { AxiosError } from "axios";

export const SIGNUP_WIRING = async (data: any) => {
  try {
    const response = await axios.post("/api/auth/signup", data);
    return response.data;
  } catch {
    throw new Error("Signup failed");
  }
};

export const SIGIN_WIRING = {
  login: async (usernameOrEmail: string, password: string) => {
    try {
      const response = await axios.post(
        "/api/auth/signin",
        { usernameOrEmail, password },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000,
        }
      );
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new Error(error.response.data.message || "Login failed");
      }
      throw new Error("Login failed");
    }
  },
};

export interface UploadResponse {
  success: boolean;
  urls?: string[];
  filecount?: number;
  error?: string;
}

export const uploadFiles = async (formData: FormData): Promise<UploadResponse> => {
  try {
    const response = await axios.post("/api/auth/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      withCredentials: true,
      timeout: 30000,
    });
    return response.data as UploadResponse;
  } catch (error) {
    if (error instanceof AxiosError && error.response) {
      throw new Error(error.response.data.error || "Upload failed");
    }
    throw new Error("Upload failed");
  }
};
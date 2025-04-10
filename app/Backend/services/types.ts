export interface UserData {
  username: string;
  email: string;
  password?: string;
  newPassword?: string;
  profilePic?: string;
}

export interface UserResponse {
  message: string;
  user: {
    id?: string;
    username: string;
    email: string;
    profilePic?: string;
  };
}

export interface UploadResponse {
  success: boolean;
  imageUrls?: string[];
  filecount?: number;
  error?: string;
}

export interface SharedFilesResponse {
  success: boolean;
  files: {
    url: string;
    filename: string;
    date: string;
  }[];
  error?: string;
}
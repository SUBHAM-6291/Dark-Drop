import ImageKit from "imagekit";
import mongoose from "mongoose";
import { UserModel } from "@/app/Backend/models/UserModel";
import { getServerSession } from "next-auth";

const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY;
const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT;

if (!IMAGEKIT_PUBLIC_KEY) throw new Error("IMAGEKIT_PUBLIC_KEY is not defined");
if (!IMAGEKIT_PRIVATE_KEY) throw new Error("IMAGEKIT_PRIVATE_KEY is not defined");
if (!IMAGEKIT_URL_ENDPOINT) throw new Error("IMAGEKIT_URL_ENDPOINT is not defined");

const imagekit = new ImageKit({
  publicKey: IMAGEKIT_PUBLIC_KEY,
  privateKey: IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: IMAGEKIT_URL_ENDPOINT,
});

export interface UploadedFile {
  url: string;
  fileId: string;
  name: string;
  uploadDate: Date;
}

export interface UploadResponse {
  success: boolean;
  imageUrls?: string[];
  filecount?: number;
  error?: string;
  details?: {
    uploadedFiles: UploadedFile[];
  };
}

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }
}

async function getAuthenticatedUser() {
  const session = await getServerSession();
  if (!session || !session.user?.email) {
    throw new Error("User not authenticated");
  }

  await connectDB();
  const user = await UserModel.findOne({ email: session.user.email }).select("email username");
  if (!user) {
    throw new Error("User not found");
  }

  return { email: user.email, username: user.username };
}

export async function uploadFile(file: File): Promise<UploadedFile> {
  const MAX_FILE_SIZE = 20 * 1024 * 1024;

  if (!file) {
    throw new Error("No file provided");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File ${file.name} exceeds 20MB limit`);
  }

  try {
    const { email, username } = await getAuthenticatedUser();
    const sanitizedEmail = email.replace(/[@.]/g, "-");
    const sanitizedUsername = username.replace(/\s/g, "-").toLowerCase();

    let imageName = file.name;
    const extension = imageName.includes(".") ? imageName.split(".").pop()?.toLowerCase() : "";
    imageName = imageName.replace(`.${extension}`, "");
    const sanitizedImageName = imageName
      .replace(/[^a-zA-Z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .toLowerCase()
      .replace(/-+/g, "-")
      .trim();
    const cleanImageName = sanitizedImageName || `image-${Date.now()}`;
    const formattedImageName = extension ? `${cleanImageName}.${extension}` : cleanImageName;

    const customFileName = `${formattedImageName}-${sanitizedUsername}-${sanitizedEmail}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await imagekit.upload({
      file: buffer,
      fileName: customFileName,
    });

    if (!result.url || !result.fileId || !result.name) {
      throw new Error("Invalid upload response from ImageKit");
    }

    return {
      url: result.url,
      fileId: result.fileId,
      name: result.name,
      uploadDate: new Date(),
    };
  } catch (error) {
    throw new Error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

export async function handleUpload(files: File[]): Promise<UploadResponse> {
  if (!files?.length) {
    return { success: false, error: "No files provided" };
  }

  try {
    const uploadedFiles = await Promise.all(files.map(uploadFile));
    return {
      success: true,
      imageUrls: uploadedFiles.map((file) => file.url),
      filecount: files.length,
      details: {
        uploadedFiles,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}
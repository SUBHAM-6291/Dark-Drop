import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";

const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY;
const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT;

if (!IMAGEKIT_PUBLIC_KEY) {
  throw new Error("IMAGEKIT_PUBLIC_KEY is not defined");
}
if (!IMAGEKIT_PRIVATE_KEY) {
  throw new Error("IMAGEKIT_PRIVATE_KEY is not defined");
}
if (!IMAGEKIT_URL_ENDPOINT) {
  throw new Error("IMAGEKIT_URL_ENDPOINT is not defined");
}

const imagekit = new ImageKit({
  publicKey: IMAGEKIT_PUBLIC_KEY,
  privateKey: IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: IMAGEKIT_URL_ENDPOINT,
});

interface UploadResponse {
  success: boolean;
  imageUrls?: string[];
  filecount?: number;
  error?: string;
}

interface UploadedFile {
  url: string;
  fileId: string;
  name: string;
}

async function uploadFile(file: File): Promise<UploadedFile> {
  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File ${file.name} exceeds 5MB limit`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await imagekit.upload({
    file: buffer,
    fileName: file.name,
  });
  return result;
}

export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse>> {
  try {
    const formData = await request.formData();
    const files = formData.getAll("file") as File[];

    if (!files.length) {
      return NextResponse.json(
        { success: false, error: "No files uploaded" },
        { status: 400 }
      );
    }

    if (files.length > 5) {
      return NextResponse.json(
        { success: false, error: "Maximum 5 files allowed" },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif"] as const;
    const MAX_SIZE = 5 * 1024 * 1024;

    for (const file of files) {
      if (!allowedTypes.includes(file.type as typeof allowedTypes[number])) {
        return NextResponse.json(
          { success: false, error: `Invalid file type: ${file.name}` },
          { status: 400 }
        );
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { success: false, error: `File too large: ${file.name}` },
          { status: 400 }
        );
      }
    }

    const uploadedFiles = await Promise.all(files.map(uploadFile));

    return NextResponse.json({
      success: true,
      imageUrls: uploadedFiles.map((file) => file.url),
      filecount: files.length,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to process files";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
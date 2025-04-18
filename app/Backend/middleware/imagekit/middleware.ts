import { NextResponse } from "next/server";
import { UploadResponse } from "@/app/Backend/imagekit/files";

export async function uploadMiddleware(files: File[]): Promise<NextResponse<UploadResponse> | void> {
  if (!files.length) {
    return NextResponse.json({ success: false, error: "No files uploaded" }, { status: 400 });
  }

  if (files.length > 10) {
    return NextResponse.json({ success: false, error: "Maximum 10 files allowed" }, { status: 400 });
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/bmp",
    "image/tiff",
    "image/webp",
    "image/heic",
    "image/jpg",
  ] as const;
  const MAX_SIZE = 20 * 1024 * 1024; // 20MB in bytes 

  for (const file of files) {
    if (!allowedTypes.includes(file.type as typeof allowedTypes[number])) {
      return NextResponse.json({ success: false, error: `Invalid file type: ${file.name}` }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: `File too large: ${file.name}` }, { status: 400 });
    }
  }
}
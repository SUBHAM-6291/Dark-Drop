import { NextRequest, NextResponse } from "next/server";
import { handleUpload, UploadResponse } from "@/app/Backend/imagekit/files";
import { connectDB } from "@/app/Backend/DB/DB";
import { UserImagesModel, IImage } from "@/app/Backend/models/url.model";
import { verifyToken } from "@/app/Backend/lib/auth/auth";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      if (err instanceof Error && err.message === "Token expired") {
        return NextResponse.json(
          { success: false, error: "Token expired, please refresh" },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    if (!decoded || typeof decoded === "string" || !("email" in decoded)) {
      return NextResponse.json(
        { success: false, error: "Invalid token payload" },
        { status: 401 }
      );
    }

    const email = decoded.email;

    await connectDB();

    const formData = await request.formData();
    const files = formData.getAll("file") as File[];
    if (!files.length) {
      return NextResponse.json(
        { success: false, error: "No files provided" },
        { status: 400 }
      );
    }

    const result: UploadResponse = await handleUpload(files);

    if (result.success && result.imageUrls && result.details?.uploadedFiles) {
      const newImages: IImage[] = result.details.uploadedFiles.map((file) => ({
        imageId: uuidv4(),
        filePath: file.url,
        fileName: file.name,
        uploadedAt: file.uploadDate || new Date(),
      }));

      await UserImagesModel.findOneAndUpdate(
        { email },
        {
          $push: { images: { $each: newImages } },
          $setOnInsert: { email },
        },
        { upsert: true }
      );
    }

    return NextResponse.json(
      {
        success: result.success,
        urls: result.imageUrls,
        filecount: result.filecount,
        error: result.error,
      },
      { status: 200 }
    );
  } catch (error) {
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
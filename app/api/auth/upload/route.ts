// app/api/auth/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { handleUpload, UploadResponse } from "@/app/Backend/imagekit/files";
import { connectDB } from "@/app/Backend/DB/DB";
import { UserImagesModel, IImage } from "@/app/Backend/models/url.model";
import { verifyToken } from "@/app/Backend/lib/auth/auth";
import { v4 as uuidv4 } from "uuid";
import { uploadMiddleware } from "@/app/Backend/middleware/imagekit/middleware";

export async function POST(request: NextRequest) {
  try {
    // Authentication
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === "string" || !("email" in decoded)) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const email = decoded.email;

    // Get form data
    const formData = await request.formData();
    const files = formData.getAll("file") as File[];
    
    // Run middleware validation
    const middlewareResponse = await uploadMiddleware(files);
    if (middlewareResponse) {
      return middlewareResponse; // Return early if middleware rejects the request
    }

    // Database connection
    await connectDB();

    // Upload files
    const result: UploadResponse = await handleUpload(files);

    // Save to database if successful
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

    // Return response
    return NextResponse.json({
      success: result.success,
      urls: result.imageUrls,
      filecount: result.filecount,
      error: result.error,
    }, { status: 200 });

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
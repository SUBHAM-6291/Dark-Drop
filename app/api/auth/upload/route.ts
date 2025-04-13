import { NextRequest, NextResponse } from "next/server";
import { handleUpload, UploadResponse } from "@/app/Backend/imagekit/files";
import { connectDB } from "@/app/Backend/DB/DB";
import { UserImagesModel, IImage } from "@/app/Backend/models/url.model";
import { verifyToken } from "@/app/Backend/lib/auth/auth";
import { TokenPayload } from "@/app/Backend/lib/auth/Types/authtoken";
import { v4 as uuidv4 } from "uuid";
import { useSession } from "next-auth/react";
import { getServerSession } from "next-auth";

export async function POST(request: NextRequest) {

  const session = await getServerSession();
  const token = request.cookies.get("token")?.value as string;

  const hasSession = session ? true : token ? true : false;

  if (!hasSession) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    let decoded: TokenPayload;

    if (session) {

      decoded = {
        id: "",
        email: session.user.email,
        username: session.user.username,
      }

    } else {
      try {
        decoded = verifyToken(token);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Invalid token";
        return NextResponse.json(
          { success: false, error: errorMessage },
          { status: 401 }
        );
      }
    }

    const email = decoded.email;
    if (!email) {
      return NextResponse.json(
        { success: false, error: "Token missing email" },
        { status: 401 }
      );
    }

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

    return NextResponse.json({
      success: result.success,
      urls: result.imageUrls || [],
      filecount: result.filecount || 0,
      error: result.error || null,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown server error";
    console.error("POST /auth/upload error:", error);
    return NextResponse.json(
      { success: false, error: `Failed to upload files: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
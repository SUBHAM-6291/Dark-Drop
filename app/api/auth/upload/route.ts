import { NextRequest, NextResponse } from "next/server";
import { handleUpload, UploadResponse } from "@/app/Backend/imagekit/files";
import { uploadMiddleware } from "@/app/Backend/middleware/imagekit/middleware";
import { connectDB } from "@/app/Backend/DB/DB";
import { UserImagesModel, IImage } from "@/app/Backend/models/url.model";
import { verifyToken } from "@/app/Backend/lib/auth/auth";
import { TokenPayload } from "@/app/Backend/lib/auth/Types/authtoken";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import { UserModel } from "@/app/Backend/models/UserModel";

async function getAuthenticatedUser(token?: string) {
  const session = await getServerSession();
  if (session && session.user?.email) {
    await connectDB();
    const user = await UserModel.findOne({ email: session.user.email }).select("email username");
    if (!user) {
      throw new Error("User not found");
    }
    return { email: user.email, username: user.username };
  }

  if (!token) {
    throw new Error("Authentication required");
  }

  let decoded: TokenPayload;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : "Invalid token");
  }

  if (!decoded.email) {
    throw new Error("Token missing email");
  }

  await connectDB();
  const user = await UserModel.findById(decoded.id).select("email username");
  if (!user) {
    throw new Error("User not found");
  }

  return { email: user.email, username: user.username };
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  try {
    const { email } = await getAuthenticatedUser(token);

    await connectDB();

    const formData = await request.formData();
    const files = formData.getAll("file") as File[];
    
    const middlewareResponse = await uploadMiddleware(files);
    if (middlewareResponse) {
      return middlewareResponse;
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
        { email: email.toLowerCase() },
        {
          $push: { images: { $each: newImages } },
          $setOnInsert: { email: email.toLowerCase() },
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
    console.error("POST /auth/upload error:", errorMessage);
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
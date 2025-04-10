import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/Backend/DB/DB";
import { UserImagesModel } from "@/app/Backend/models/url.model";
import { verifyToken } from "@/app/Backend/lib/auth/auth";
import { TokenPayload } from "@/app/Backend/lib/auth/Types/authtoken";

interface FileResponse {
  url: string;
  filename: string;
  date: string;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    let decoded: TokenPayload;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Invalid token";
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 401 }
      );
    }

    if (!decoded.email) {
      return NextResponse.json(
        { success: false, error: "Token missing email" },
        { status: 401 }
      );
    }

    const email = decoded.email;

    await connectDB();

    const userImages = await UserImagesModel.findOne({ email });
    if (!userImages || !userImages.images.length) {
      return NextResponse.json({ success: true, files: [] });
    }

    const sharedFiles: FileResponse[] = userImages.images.map((file) => ({
      url: file.filePath,
      filename: file.fileName,
      date: file.uploadedAt.toISOString(),
    }));

    return NextResponse.json({ success: true, files: sharedFiles });
  } catch (error) {
    console.error("GET /auth/images error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Failed to fetch files: ${errorMessage}` },
      { status: 500 }
    );
  }
}
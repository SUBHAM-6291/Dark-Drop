import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/Backend/DB/DB";
import { UserImagesModel } from "@/app/Backend/models/url.model";
import { verifyToken } from "@/app/Backend/lib/auth/auth";

export async function GET(request: NextRequest) {
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

    const userImages = await UserImagesModel.findOne({ email });
    if (!userImages || !userImages.images.length) {
      return NextResponse.json({ success: true, files: [] });
    }

    const sharedFiles = userImages.images.map((file) => ({
      url: file.filePath,
      filename: file.fileName,
      date: file.uploadedAt.toISOString(),
    }));

    return NextResponse.json({ success: true, files: sharedFiles });
  } catch (error) {
    console.error("Error fetching shared files:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}
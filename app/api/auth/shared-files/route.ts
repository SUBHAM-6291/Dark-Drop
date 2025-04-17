import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/Backend/DB/DB";
import { UserImagesModel } from "@/app/Backend/models/url.model";
import { authenticateRequest } from "@/app/Backend/middleware/auth";

interface FileResponse {
  url: string;
  filename: string;
  date: string;
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const email = authResult.email;
    await connectDB();

    const userImages = await UserImagesModel.findOne({ email });
    if (!userImages || !userImages.images.length) {
      console.log(`GET /file-handlers/shared-files: No files found for email=${email}`);
      return NextResponse.json({ success: true, files: [] });
    }

    const sharedFiles: FileResponse[] = userImages.images.map((file) => ({
      url: file.filePath,
      filename: file.fileName,
      date: file.uploadedAt.toISOString(),
    }));

    console.log(`GET /file-handlers/shared-files: Found ${sharedFiles.length} files for email=${email}`);
    return NextResponse.json({ success: true, files: sharedFiles });
  } catch (error) {
    console.error("GET /file-handlers/shared-files error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Failed to fetch files: ${errorMessage}` },
      { status: 500 }
    );
  }
}
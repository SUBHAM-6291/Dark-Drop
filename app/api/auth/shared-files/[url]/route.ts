import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/Backend/DB/DB";
import { UserImagesModel } from "@/app/Backend/models/url.model";
import { authenticateRequest } from "@/app/Backend/middleware/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ url: string }> }
) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const email = authResult.email;
    const { url } = await params;
    const decodedUrl = decodeURIComponent(url);
    const { filename } = await request.json();

    if (!filename || typeof filename !== "string") {
      console.log("PUT /file-handlers/shared-files/[url]: Invalid filename:", filename);
      return NextResponse.json(
        { success: false, error: "Filename is required and must be a string" },
        { status: 400 }
      );
    }

    await connectDB();

    console.log(`PUT /file-handlers/shared-files/[url]: Updating filename for email=${email}, url=${decodedUrl}, newFilename=${filename}`);

    const result = await UserImagesModel.updateOne(
      { email, "images.filePath": decodedUrl },
      { $set: { "images.$.fileName": filename } }
    );

    if (result.modifiedCount === 1) {
      console.log("PUT /file-handlers/shared-files/[url]: Filename updated successfully");
      return NextResponse.json({ success: true, message: "Filename updated" });
    } else {
      console.log(`PUT /file-handlers/shared-files/[url]: File not found for email=${email}, url=${decodedUrl}`);
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("PUT /file-handlers/shared-files/[url] error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Failed to update filename: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ url: string }> }
) {
  try {
    const authResult = await authenticateRequest(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const email = authResult.email;
    const { url } = await params;
    const decodedUrl = decodeURIComponent(url);

    await connectDB();

    console.log(`DELETE /file-handlers/shared-files/[url]: Deleting file for email=${email}, url=${decodedUrl}`);

    const result = await UserImagesModel.updateOne(
      { email },
      { $pull: { images: { filePath: decodedUrl } } }
    );

    if (result.modifiedCount === 1) {
      console.log("DELETE /file-handlers/shared-files/[url]: File deleted successfully");
      return NextResponse.json({ success: true, message: "File deleted" });
    } else {
      console.log(`DELETE /file-handlers/shared-files/[url]: File not found for email=${email}, url=${decodedUrl}`);
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("DELETE /file-handlers/shared-files/[url] error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Failed to delete file: ${errorMessage}` },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/Backend/DB/DB";
import { UserImagesModel } from "@/app/Backend/models/url.model";
import { verifyToken } from "@/app/Backend/lib/auth/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { url: string } }
) {
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
    const decodedUrl = decodeURIComponent(params.url);

    await connectDB();

    const result = await UserImagesModel.updateOne(
      { email },
      { $pull: { images: { filePath: decodedUrl } } }
    );

    if (result.modifiedCount === 1) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete file" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { url: string } }
) {
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
    const decodedUrl = decodeURIComponent(params.url);
    const { filename } = await request.json();

    if (!filename || typeof filename !== "string") {
      return NextResponse.json(
        { success: false, error: "Filename is required and must be a string" },
        { status: 400 }
      );
    }

    await connectDB();

    const result = await UserImagesModel.updateOne(
      { email, "images.filePath": decodedUrl },
      { $set: { "images.$.fileName": filename } }
    );

    if (result.modifiedCount === 1) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error updating filename:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update filename" },
      { status: 500 }
    );
  }
}
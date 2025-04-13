import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/Backend/DB/DB";
import { UserImagesModel } from "@/app/Backend/models/url.model";
import { verifyToken } from "@/app/Backend/lib/auth/auth";
import { TokenPayload } from "@/app/Backend/lib/auth/Types/authtoken";
import { getServerSession } from "next-auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ url: string }> }
) {
  try {
    const session = await getServerSession();
    const token = request.cookies.get("token")?.value as string;

    const hasSession = session ? true : token ? true : false;

    if (!hasSession) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }


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

    if (!decoded.email) {
      return NextResponse.json(
        { success: false, error: "Token missing email" },
        { status: 401 }
      );
    }

    const email = decoded.email;
    const { url } = await params;
    const decodedUrl = decodeURIComponent(url);

    await connectDB();

    const result = await UserImagesModel.updateOne(
      { email },
      { $pull: { images: { filePath: decodedUrl } } }
    );

    if (result.modifiedCount === 1) {
      return NextResponse.json({ success: true, message: "File deleted" });
    } else {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("DELETE /auth/shared-files/[url] error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Failed to delete file: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ url: string }> }
) {
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
    const { url } = await params;
    const decodedUrl = decodeURIComponent(url);
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
      return NextResponse.json({ success: true, message: "Filename updated" });
    } else {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("PUT /auth/shared-files/[url] error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Failed to update filename: ${errorMessage}` },
      { status: 500 }
    );
  }
}
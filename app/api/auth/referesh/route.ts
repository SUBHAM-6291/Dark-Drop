import { NextRequest, NextResponse } from "next/server";
import {
  setCookie,
  signToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/app/Backend/lib/auth/auth";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("refreshToken")?.value;
    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: "No refresh token provided" },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      console.error("Refresh token verification error:", err);
      return NextResponse.json(
        { success: false, error: err instanceof Error ? err.message : "Invalid refresh token" },
        { status: 401 }
      );
    }

    if (typeof decoded === "string" || !("email" in decoded) || !("id" in decoded)) {
      return NextResponse.json(
        { success: false, error: "Invalid refresh token payload" },
        { status: 401 }
      );
    }

    const newAccessToken = signToken({ email: decoded.email, id: decoded.id });
    const newRefreshToken = signRefreshToken({ email: decoded.email, id: decoded.id });

    let response = NextResponse.json({ 
      success: true,
      accessToken: newAccessToken
    });
    response = setCookie(response, newAccessToken, newRefreshToken);

    return response;
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to refresh token" },
      { status: 500 }
    );
  }
}
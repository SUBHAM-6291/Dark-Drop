import { NextRequest, NextResponse } from "next/server";
import {
  setCookie,
  signToken,
  signRefreshToken,
  verifyRefreshToken,
} from "@/app/Backend/lib/auth/auth";
import { TokenPayload } from "@/app/Backend/lib/auth/Types/authtoken";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get("refreshToken")?.value;
    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: "No refresh token provided" },
        { status: 401 }
      );
    }

    let decoded: TokenPayload;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Invalid refresh token";
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 401 }
      );
    }

    if (!decoded.id || !decoded.username || decoded.email === null) {
      return NextResponse.json(
        { success: false, error: "Invalid refresh token payload" },
        { status: 401 }
      );
    }

    const payload: TokenPayload = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
    };

    const newAccessToken = signToken(payload);
    const newRefreshToken = signRefreshToken(payload);

    let response = NextResponse.json({
      success: true,
      message: "Tokens refreshed successfully",
    });
    response = setCookie(response, newAccessToken, newRefreshToken);

    return response;
  } catch (error) {
    console.error("POST /auth/refresh error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Failed to refresh token: ${errorMessage}` },
      { status: 500 }
    );
  }
}
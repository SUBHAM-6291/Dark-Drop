// app/api/auth/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { verifyToken } from "@/app/Backend/lib/auth/auth";
import { TokenPayload } from "@/app/Backend/lib/auth/Types/authtoken";

export async function authenticateRequest(request: NextRequest) {
  try {
    const session = await getServerSession();
    const token = request.cookies.get("token")?.value;

    const hasSession = session ? true : token ? true : false;

    if (!hasSession) {
      console.log("Authentication required");
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
      };
    } else {
      try {
        decoded = verifyToken(token!);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Invalid token";
        console.log("Token verification failed:", errorMessage);
        return NextResponse.json(
          { success: false, error: errorMessage },
          { status: 401 }
        );
      }
    }

    if (!decoded.email) {
      console.log("Token missing email");
      return NextResponse.json(
        { success: false, error: "Token missing email" },
        { status: 401 }
      );
    }

    return decoded;
  } catch (error) {
    console.error("Authentication error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: `Authentication failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}
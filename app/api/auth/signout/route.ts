import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();

    cookieStore.delete("token");
    cookieStore.delete("refreshToken");
    cookieStore.delete("next-auth.session-token");

    console.log("Cookies cleared: token, refreshToken, next-auth.session-token");

    return NextResponse.json({
      success: true,
      message: "You've logged out successfully!",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to logout" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore =await cookies();

    console.log("Cookies before logout:", cookieStore.getAll());

    cookieStore.set("next-auth.session-token", "", {
      path: "/",
      expires: new Date(0),
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    cookieStore.set("next-auth.csrf-token", "", {
      path: "/",
      expires: new Date(0),
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    cookieStore.set("token", "", {
      path: "/",
      expires: new Date(0),
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    cookieStore.set("refreshToken", "", {
      path: "/",
      expires: new Date(0),
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    console.log("Cookies after logout:", cookieStore.getAll());

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
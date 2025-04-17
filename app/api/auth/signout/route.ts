import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
 try {
 const response = NextResponse.json({
 success: true,
 message: "You've logged out successfully!",
 });

 // Clear all auth-related cookies
 response.cookies.set("next-auth.session-token", "", {
 path: "/",
 expires: new Date(0),
 secure: process.env.NODE_ENV === "production",
 sameSite: "lax",
 });

 response.cookies.set("next-auth.csrf-token", "", {
 path: "/",
 expires: new Date(0),
 secure: process.env.NODE_ENV === "production",
 sameSite: "lax",
 });

 response.cookies.set("token", "", {
 path: "/",
 expires: new Date(0),
 secure: process.env.NODE_ENV === "production",
 sameSite: "lax",
 });

 response.cookies.set("refreshToken", "", {
 path: "/",
 expires: new Date(0),
 secure: process.env.NODE_ENV === "production",
 sameSite: "lax",
 });

 console.log("Logout successful");
 return response;
 } catch (error) {
 console.error("Logout error:", error);
 return NextResponse.json(
 { success: false, error: "Failed to logout" },
 { status: 500 }
 );
 }
}
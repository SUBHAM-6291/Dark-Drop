import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "../lib/auth/auth";
import { TokenPayload } from "../lib/auth/Types/authtoken";

export async function authMiddleware(req: NextRequest, next: () => Promise<NextResponse>) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(
      new URL("/signup?message=Please log in again because no token was provided", req.url)
    );
  }

  try {
    const decoded = verifyToken(token) as TokenPayload;
    (req as any).user = decoded;
    return await next();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Invalid token";
    return NextResponse.redirect(
      new URL(`/signup?message=Please log in again because: ${errorMessage}`, req.url)
    );
  }
}
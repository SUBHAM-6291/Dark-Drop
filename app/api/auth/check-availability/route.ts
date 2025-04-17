import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/Backend/DB/DB";
import { UserModel } from "@/app/Backend/models/UserModel";

export async function POST(req: NextRequest) {
  try {
    const { username, email } = await req.json();

    await connectDB();

    const response: { username?: string; email?: string } = {};

    if (username) {
      const usernameExists = await UserModel.findOne({ username });
      if (usernameExists) {
        response.username = "This username is already taken.";
      }
    }

    if (email) {
      const emailExists = await UserModel.findOne({ email });
      if (emailExists) {
        response.email = "This email is already registered.";
      }
    }

    if (!username && !email) {
      return NextResponse.json(
        { error: "Please provide a username or email to check." },
        { status: 400 }
      );
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("POST /auth/check-availability error:", error);
    return NextResponse.json(
      { error: "Failed to check availability. Please try again." },
      { status: 500 }
    );
  }
}
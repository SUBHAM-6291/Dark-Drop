import { NextRequest, NextResponse } from "next/server";
import {
  hashPassword,
  signToken,
  signRefreshToken,
  setCookie,
} from "@/app/Backend/lib/auth/auth";
import { connectDB } from "@/app/Backend/DB/DB";
import { UserModel } from "@/app/Backend/models/UserModel";
import { getServerSession } from "next-auth";
import { TokenPayload } from "@/app/Backend/lib/auth/Types/authtoken";

interface UserResponse {
  id: string;
  username: string;
  email: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (session) {
      console.log("POST /auth/signup: User already authenticated via session");
      return NextResponse.json(
        { error: "You are already logged in. Please log out to create a new account." },
        { status: 403 }
      );
    }

    const { username, email, password } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      console.log("POST /auth/signup: Invalid email format");
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }
    if (!username || typeof username !== "string" || username.length < 3) {
      console.log("POST /auth/signup: Invalid username");
      return NextResponse.json(
        { error: "Username must be at least 3 characters long." },
        { status: 400 }
      );
    }
    if (!password || typeof password !== "string" || password.length < 3) {
      console.log("POST /auth/signup: Invalid password");
      return NextResponse.json(
        { error: "Password must be at least 3 characters long." },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await UserModel.findOne({ email, username });
    if (existingUser) {
      console.log(
        `POST /auth/signup: Username=${username} and email=${email} already in use by the same user`
      );
      return NextResponse.json(
        {
          error: "This username and email are already taken by another user. Please choose a different username and email.",
        },
        { status: 409 }
      );
    }

    const emailExists = await UserModel.findOne({ email });
    if (emailExists) {
      console.log(`POST /auth/signup: Email=${email} already in use`);
      return NextResponse.json(
        { error: "This email is already registered. Please use a different email." },
        { status: 409 }
      );
    }

    const usernameExists = await UserModel.findOne({ username });
    if (usernameExists) {
      console.log(`POST /auth/signup: Username=${username} already in use`);
      return NextResponse.json(
        { error: "This username is already taken. Please change your username." },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    if (!hashedPassword) {
      console.error("POST /auth/signup: Failed to hash password");
      return NextResponse.json(
        { error: "Failed to process password. Please try again." },
        { status: 500 }
      );
    }

    const newUser = await UserModel.create({
      username,
      email,
      password: hashedPassword,
    });

    const payload: TokenPayload = {
      id: newUser._id.toString(),
      username: newUser.username,
      email: newUser.email ?? null,
    };
    const accessToken = signToken(payload);
    const refreshToken = signRefreshToken(payload);

    let response = NextResponse.json({
      message: "Signup successful! Welcome to Darkdrop.",
      user: {
        id: payload.id,
        username: payload.username,
        email: payload.email,
      },
    });

    response = setCookie(response, accessToken, refreshToken);
    console.log(`POST /auth/signup: User created successfully for email=${email}`);

    return response;
  } catch (error) {
    console.error("POST /auth/signup error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json(
      { error: "Signup failed. Please try again later.", details: errorMessage },
      { status: 500 }
    );
  }
}
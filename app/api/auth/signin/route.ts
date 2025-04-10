import { NextRequest, NextResponse } from "next/server";
import {
  hashPassword,
  verifyToken,
  signToken,
  signRefreshToken,
  setCookie,
} from "@/app/Backend/lib/auth/auth";
import { connectDB } from "@/app/Backend/DB/DB";
import { UserModel } from "@/app/Backend/models/UserModel";
import { TokenPayload } from "@/app/Backend/lib/auth/Types/authtoken";

interface UserResponse {
  id: string;
  username: string;
  email: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const token =
      req.cookies.get("token")?.value ??
      req.headers.get("authorization")?.replace("Bearer ", "");
    const { username, email, password } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await connectDB();

    if (token) {
      try {
        const decoded: TokenPayload = verifyToken(token);
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
          const payload: TokenPayload = {
            id: existingUser._id.toString(),
            username: existingUser.username,
            email: existingUser.email ?? null,
          };
          const accessToken = signToken(payload);
          const refreshToken = signRefreshToken(payload);

          let response = NextResponse.json({
            message: "Access granted",
            user: {
              id: payload.id,
              username: payload.username,
              email: payload.email,
            },
          });
          response = setCookie(response, accessToken, refreshToken);
          return response;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Invalid token";
        console.log("Token verification failed:", errorMessage);
      }
    }

    if (!username) {
      return NextResponse.json(
        { error: "Username is required for signup" },
        { status: 400 }
      );
    }
    if (!password) {
      return NextResponse.json(
        { error: "Password is required for signup" },
        { status: 400 }
      );
    }

    const userExists = await UserModel.findOne({ email });
    if (userExists) {
      return NextResponse.json(
        { error: "User already exists with this email" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
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
      message: "Signup successful",
      user: {
        id: payload.id,
        username: payload.username,
        email: payload.email,
      },
    });
    response = setCookie(response, accessToken, refreshToken);

    return response;
  } catch (error) {
    console.error("POST /auth/signup error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Signup failed", details: errorMessage },
      { status: 500 }
    );
  }
}
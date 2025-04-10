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
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }
    if (!username) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }
    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    await connectDB();

    if (token) {
      try {
        const decoded: TokenPayload = verifyToken(token);
        const existingUser = await UserModel.findOne({ 
          email,
          username: decoded.username
        });

        if (!existingUser) {
          return NextResponse.json(
            { 
              error: "Access denied: Invalid email or username combination" 
            },
            { status: 403 }
          );
        }

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
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Invalid token";
        console.log("Token verification failed:", errorMessage);
        return NextResponse.json(
          { error: "Invalid or expired token" },
          { status: 401 }
        );
      }
    }

    const emailExists = await UserModel.findOne({ email });
    const usernameExists = await UserModel.findOne({ username });

    if (emailExists && usernameExists) {
      return NextResponse.json(
        { 
          error: "This username and email are already in use. Please choose a different username and email." 
        },
        { status: 409 }
      );
    } else if (emailExists) {
      return NextResponse.json(
        { 
          error: "This email is already in use. Please change your email." 
        },
        { status: 409 }
      );
    } else if (usernameExists) {
      return NextResponse.json(
        { 
          error: "This username is already taken. Please change your username." 
        },
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
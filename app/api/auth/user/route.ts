import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/app/Backend/DB/DB";
import { UserModel } from "@/app/Backend/models/UserModel";
import { UserImagesModel } from "@/app/Backend/models/url.model";
import { verifyToken, hashPassword } from "@/app/Backend/lib/auth/auth";
import { TokenPayload } from "@/app/Backend/lib/auth/Types/authtoken";
import { getServerSession } from "next-auth";

interface User {
  username: string;
  email: string | null;
  password?: string;
  name?: string | null;
}

interface UserResponse {
  username: string;
  email: string | null;
}

export async function GET(req: NextRequest) {

  const session = await getServerSession();

  try {

    if (session) {
      const response = {
        username: session.user.email?.split('@')[0] || session.user.name,
        email: session.user.email,
      };
  
      return NextResponse.json({ user: response });
    }


    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: TokenPayload = verifyToken(token);

    await connectDB();
    const user = await UserModel.findById(decoded.id).select("-password");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const response: UserResponse = {
      username: user.username,
      email: user.email ?? null,
    };

    return NextResponse.json({ user: response });
  } catch (error) {
    console.error("GET /auth/user error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: `Server error: ${errorMessage}` }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: TokenPayload = verifyToken(token);

    const { username, email, password } = await req.json();

    if (!username || !email) {
      return NextResponse.json(
        { error: "Username and email are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const currentUser = await UserModel.findById(decoded.id).select("email");
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const emailChanged = currentUser.email !== email;

    const updateData: Partial<User> = { username, email };
    if (password) {
      updateData.password = await hashPassword(password);
    }

    const user = await UserModel.findByIdAndUpdate(
      decoded.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (emailChanged) {
      const userImages = await UserImagesModel.findOneAndUpdate(
        { email: currentUser.email },
        { email: email },
        { new: true, upsert: true }
      );
      if (!userImages) {
        console.error("Failed to update or create UserImages document");
        return NextResponse.json(
          {
            message: "Profile updated, but failed to update user images",
            user: { username: user.username, email: user.email ?? null },
          },
          { status: 207 }
        );
      }
    }

    const response: UserResponse = {
      username: user.username,
      email: user.email ?? null,
    };

    return NextResponse.json({ message: "Profile updated", user: response });
  } catch (error) {
    console.error("PUT /auth/user error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: `Server error: ${errorMessage}` }, { status: 500 });
  }
}
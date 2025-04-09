import { NextRequest, NextResponse } from "next/server";
import { hashPassword, comparePassword } from "@/app/Backend/lib/auth/auth";
import { connectDB } from "@/app/Backend/DB/DB";
import { UserModel, IUser } from "@/app/Backend/models/UserModel";
import { writeFile } from "fs/promises";
import path from "path";

interface UserResponse {
  message: string;
  user: {
    username: string;
    email: string;
    profilePic?: string;
  };
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();
    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await UserModel.findOne({ email }).lean<IUser>();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const response: UserResponse = {
      message: "User data fetched successfully",
      user: {
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: any) {
    console.error("Fetch user error:", error);
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    await connectDB();
    const formData = await req.formData();
    const email = formData.get("email") as string;
    const currentPassword = formData.get("currentPassword") as string;
    const username = formData.get("username") as string | null;
    const newPassword = formData.get("newPassword") as string | null;
    const profilePicFile = formData.get("profilePic") as File | null;

    if (!email || !currentPassword) {
      return NextResponse.json(
        { error: "Email and current password are required" },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({ email }).select("+password").lean<IUser>();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const passwordMatch = await comparePassword(currentPassword, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Incorrect current password" }, { status: 401 });
    }

    const updateData: Partial<IUser> = {};
    if (username) updateData.username = username;
    if (newPassword) updateData.password = await hashPassword(newPassword);
    if (profilePicFile) {
      const buffer = Buffer.from(await profilePicFile.arrayBuffer());
      const filename = `${Date.now()}-${profilePicFile.name}`;
      const filePath = path.join(process.cwd(), "public/uploads", filename);
      await writeFile(filePath, buffer);
      updateData.profilePic = `/uploads/${filename}`;
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      { email },
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean<IUser>();

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found after update" }, { status: 404 });
    }

    const responseData: UserResponse = {
      message: "Profile updated successfully",
      user: {
        username: updatedUser.username,
        email: updatedUser.email,
        profilePic: updatedUser.profilePic,
      },
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error("Update user error:", error);
    if (error.code === 11000) {
      return NextResponse.json({ error: "Username or email already in use" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
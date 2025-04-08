import { NextRequest, NextResponse } from "next/server";
import { UserModel } from "@/app/Backend/models/UserModel";
import { comparePassword } from "@/app/Backend/lib/auth/auth";
import { connectDB } from "@/app/Backend/DB/DB";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { usernameOrEmail, password } = await req.json();

    if (!usernameOrEmail || !password) {
      return NextResponse.json(
        { success: false, message: "Missing username/email or password" },
        { status: 400 }
      );
    }

    const user = await UserModel.findOne({
      $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
    }).select("+password");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 401 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { success: false, message: "No password set for this user" },
        { status: 401 }
      );
    }

    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid password" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user._id.toString(),
          email: user.email,
          username: user.username,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error during signin" },
      { status: 500 }
    );
  }
}

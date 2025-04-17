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
  try {
    const session = await getServerSession();
    const token = req.cookies.get("token")?.value;

    const hasSession = session ? true : token ? true : false;

    if (!hasSession) {
      console.log("GET /auth/user: Authentication required");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded: TokenPayload;
    if (session) {
      if (!session.user?.email) {
        console.log("GET /auth/user: Session missing email");
        return NextResponse.json({ error: "Session missing email" }, { status: 401 });
      }
      decoded = {
        id: "",
        email: session.user.email,
        username: session.user.name || session.user.email.split("@")[0],
      };
      const response: UserResponse = {
        username: decoded.username!,
        email: decoded.email,
      };
      console.log(`GET /auth/user: Returning user data for email=${decoded.email}`);
      return NextResponse.json({ user: response });
    }

    try {
      decoded = verifyToken(token!);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Invalid token";
      console.log("GET /auth/user: Token verification failed:", errorMessage);
      return NextResponse.json({ error: errorMessage }, { status: 401 });
    }

    if (!decoded.email) {
      console.log("GET /auth/user: Token missing email");
      return NextResponse.json({ error: "Token missing email" }, { status: 401 });
    }

    await connectDB();
    const user = await UserModel.findById(decoded.id).select("-password");
    if (!user) {
      console.log(`GET /auth/user: User not found for id=${decoded.id}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const response: UserResponse = {
      username: user.username,
      email: user.email ?? null,
    };

    console.log(`GET /auth/user: Returning user data for email=${user.email}`);
    return NextResponse.json({ user: response });
  } catch (error) {
    console.error("GET /auth/user error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: `Server error: ${errorMessage}` }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession();
    const token = req.cookies.get("token")?.value;

    const hasSession = session ? true : token ? true : false;

    if (!hasSession) {
      console.log("PUT /auth/user: Authentication required");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded: TokenPayload;
    if (session) {
      if (!session.user?.email) {
        console.log("PUT /auth/user: Session missing email");
        return NextResponse.json({ error: "Session missing email" }, { status: 401 });
      }
      decoded = {
        id: "",
        email: session.user.email,
        username: session.user.name || session.user.email.split("@")[0],
      };
    } else {
      try {
        decoded = verifyToken(token!);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Invalid token";
        console.log("PUT /auth/user: Token verification failed:", errorMessage);
        return NextResponse.json({ error: errorMessage }, { status: 401 });
      }
    }

    if (!decoded.email) {
      console.log("PUT /auth/user: Token missing email");
      return NextResponse.json({ error: "Token missing email" }, { status: 401 });
    }

    const { username, email, password } = await req.json();

    if (!username || !email) {
      console.log("PUT /auth/user: Username and email are required");
      return NextResponse.json(
        { error: "Username and email are required" },
        { status: 400 }
      );
    }

    await connectDB();

    let user;
    if (session) {
      user = await UserModel.findOne({ email: decoded.email }).select("email");
      if (!user) {
        console.log(`PUT /auth/user: User not found for email=${decoded.email}`);
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      decoded.id = user._id.toString();
    } else {
      user = await UserModel.findById(decoded.id).select("email");
      if (!user) {
        console.log(`PUT /auth/user: User not found for id=${decoded.id}`);
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
    }

    const emailChanged = user.email !== email;

    const updateData: Partial<User> = { username, email };
    if (password) {
      updateData.password = await hashPassword(password);
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      decoded.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      console.log(`PUT /auth/user: Failed to update user for id=${decoded.id}`);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (emailChanged) {
      console.log(
        `PUT /auth/user: Attempting to update UserImagesModel email from ${user.email} to ${email}`
      );
      try {
        const userImages = await UserImagesModel.findOneAndUpdate(
          { email: user.email.toLowerCase() },
          { email: email.toLowerCase() },
          { new: true }
        );
        if (!userImages) {
          console.log(
            `PUT /auth/user: No UserImagesModel found for email=${user.email}, no update performed`
          );
        } else {
          console.log(
            `PUT /auth/user: Successfully updated UserImagesModel for email=${email}`
          );
        }
      } catch (error) {
        console.error(
          `PUT /auth/user: Error updating UserImagesModel for email=${email}`,
          error
        );
      }
    }

    const response: UserResponse = {
      username: updatedUser.username,
      email: updatedUser.email ?? null,
    };

    console.log(`PUT /auth/user: Profile updated for email=${updatedUser.email}`);
    return NextResponse.json({ message: "Profile updated", user: response });
  } catch (error) {
    console.error("PUT /auth/user error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown server error";
    return NextResponse.json({ error: `Server error: ${errorMessage}` }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { cookies } from 'next/headers'
import {
    verifyToken,
} from "@/app/Backend/lib/auth/auth";

export async function POST(req: NextRequest) {

    const cookieItems = await cookies();

    try {
        const token = cookieItems.get('token')?.value ?? req.headers.get('authorization')?.replace('Bearer ', '');

        console.log("Token", token);


        if (!token) {
            return NextResponse.json(
                { success: false, error: "No token provided" },
                { status: 401 }
            );
        }

        let decoded;
        try {
            decoded = verifyToken(token as string);
        } catch (err) {
            console.error("Token verification error:", err);
            return NextResponse.json(
                { success: false, error: err instanceof Error ? err.message : "Invalid token" },
                { status: 401 }
            );
        }

        if (typeof decoded === "string" || !("email" in decoded) || !("id" in decoded)) {
            return NextResponse.json(
                { success: false, error: "Invalid Token" },
                { status: 401 }
            );
        }

        cookieItems.delete("token")
        cookieItems.delete("refreshToken")
        req.cookies.clear();

        return NextResponse.json({
            success: true,
            message: "You've logout successfully!"
        });

    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to Logout" },
            { status: 500 }
        );
    }
}
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import * as EmailValidator from "email-validator";
import { NextResponse } from "next/server";
import { TokenPayload } from "./Types/authtoken";

const JWT_SECRET = process.env.JWT_SECRET || (() => { throw new Error("JWT_SECRET is missing in .env"); })();
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || (() => { throw new Error("JWT_REFRESH_SECRET is missing in .env"); })();

const SALT_ROUNDS = 10;

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new Error("Token expired");
    }
    throw new Error("Invalid token");
  }
}

export function verifyRefreshToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET) as TokenPayload;
    return decoded;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new Error("Refresh token expired");
    }
    throw new Error("Invalid refresh token");
  }
}

export const hashPassword = async (password: string): Promise<string> => {
  if (!password || password.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    return await bcrypt.hash(password, salt);
  } catch (err) {
    throw new Error(`Failed to hash password: ${err instanceof Error ? err.message : "Unknown error"}`);
  }
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  if (!password || !hash) {
    throw new Error("Password and hash are required for comparison");
  }
  try {
    return await bcrypt.compare(password, hash);
  } catch (err) {
    throw new Error(`Failed to compare password: ${err instanceof Error ? err.message : "Unknown error"}`);
  }
};

export const isValidEmail = (email: string): boolean => {
  return EmailValidator.validate(email);
};

export const setCookie = <T>(
  res: NextResponse<T>,
  accessToken: string,
  refreshToken: string
): NextResponse<T> => {
  // Clear existing cookies
  res.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0, // Expire immediately
    path: "/",
  });
  res.cookies.set("refreshToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0, // Expire immediately
    path: "/",
  });

  // Set new cookies
  res.cookies.set("token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 1000, // 1 hour
    path: "/",
  });
  res.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/",
  });
  return res;
};
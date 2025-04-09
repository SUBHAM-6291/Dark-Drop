// app/Backend/lib/auth/auth.ts
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import * as EmailValidator from "email-validator";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("Please add JWT_SECRET to your .env.local file");
}
if (!REFRESH_SECRET) {
  throw new Error("Please add JWT_REFRESH_SECRET to your .env.local file");
}

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

export function signRefreshToken(payload: object) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      console.error("Token expired at:", err.expiredAt);
      throw new Error("Token expired");
    }
    console.error("Token verification failed:", err);
    throw new Error("Invalid token");
  }
}

export function verifyRefreshToken(token: string) {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      console.error("Refresh token expired at:", err.expiredAt);
      throw new Error("Refresh token expired");
    }
    console.error("Refresh token verification failed:", err);
    throw new Error("Invalid refresh token");
  }
}

const saltRounds = 12;

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

export const isValidEmail = (email: string) => {
  return EmailValidator.validate(email);
};

export const setCookie = <T>(
  res: NextResponse<T>,
  accessToken: string,
  refreshToken: string
): NextResponse<T> => {
  res.cookies.set("token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 1000,
    path: "/",
  });
  res.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });
  return res;
};
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import * as EmailValidator from "email-validator";
import { NextResponse } from "next/server";

// Load secrets from environment variables
const JWT_SECRET = process.env.JWT_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

// Ensure secrets are defined
if (!JWT_SECRET) {
  throw new Error("Please add JWT_SECRET to your .env file");
}
if (!REFRESH_SECRET) {
  throw new Error("Please add JWT_REFRESH_SECRET to your .env file");
}

// Sign an access token (1-hour expiration)
export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

// Sign a refresh token (7-day expiration)
export function signRefreshToken(payload: object) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
}

// Verify an access token with debugging
export function verifyToken(token: string) {
  console.log("Verifying token:", token); // Debug: Log the token being verified
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Decoded token:", decoded); // Debug: Log the decoded payload
    return decoded;
  } catch (err) {
    console.error("Token verification error:", err); // Debug: Log the full error
    if (err instanceof jwt.TokenExpiredError) {
      console.error("Token expired at:", err.expiredAt);
      throw new Error("Token expired");
    }
    throw new Error("Invalid token");
  }
}

// Verify a refresh token with debugging
export function verifyRefreshToken(token: string) {
  console.log("Verifying refresh token:", token); // Debug: Log the refresh token
  try {
    const decoded = jwt.verify(token, REFRESH_SECRET);
    console.log("Decoded refresh token:", decoded); // Debug: Log the decoded payload
    return decoded;
  } catch (err) {
    console.error("Refresh token verification error:", err); // Debug: Log the full error
    if (err instanceof jwt.TokenExpiredError) {
      console.error("Refresh token expired at:", err.expiredAt);
      throw new Error("Refresh token expired");
    }
    throw new Error("Invalid refresh token");
  }
}

// Password hashing configuration
const saltRounds = 12;

// Hash a password
export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(password, salt);
};

// Compare a password with its hash
export const comparePassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

// Validate an email address
export const isValidEmail = (email: string) => {
  return EmailValidator.validate(email);
};

// Set cookies for access and refresh tokens
export const setCookie = <T>(
  res: NextResponse<T>,
  accessToken: string,
  refreshToken: string
): NextResponse<T> => {
  res.cookies.set("token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
    path: "/",
  });
  res.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: "/",
  });
  return res;
};
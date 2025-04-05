import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import * as EmailValidator from 'email-validator';

 const JWT_SECRET = process.env.JWT_SECRET as string;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;

if (!JWT_SECRET) {
  throw new Error('Please add JWT_SECRET to your .env.local file');
}
if (!REFRESH_SECRET) {
  throw new Error('Please add JWT_REFRESH_SECRET to your .env.local file');
}

export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
}

export function signRefreshToken(payload: object) {
    return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token,JWT_SECRET);
  } catch (err) {
    console.error("Token verification failed:", err);
    return null;
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
}

export const setCookie = (res: any, accessToken: string) => {
  res.cookie("token", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000
  });
};
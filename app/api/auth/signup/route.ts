import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, verifyToken, signToken } from '@/app/Backend/lib/auth/auth';
import { connectDB } from '@/app/Backend/DB/DB';
import { UserModel } from '@/app/Backend/models/UserModel';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value ??req.headers.get('authorization')?.split(' ')[1];
    if (token && verifyToken(token)) {
      return NextResponse.json({ error: 'Already logged in' }, { status: 403 });
    }

    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 });
    }

    await connectDB();

    const userExists = await UserModel.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await UserModel.create({
      username,
      email,
      password: hashedPassword,
    });

    const accessToken = signToken({ id: newUser._id, username, email });

    const response = NextResponse.json(
      { message: 'Signup successful', user: { id: newUser._id, username, email } },
      { status: 201 }
    );
    response.cookies.set('token', accessToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 1000,
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}
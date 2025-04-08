import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, verifyToken, signToken } from '@/app/Backend/lib/auth/auth';
import { connectDB } from '@/app/Backend/DB/DB';
import { UserModel } from '@/app/Backend/models/UserModel';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value ?? req.headers.get('authorization')?.replace('Bearer ', '');
    
    const { username, email, password } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    await connectDB();

    if (token) {
      if (verifyToken(token)) {
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
          const accessToken = signToken({ 
            id: existingUser._id, 
            username: existingUser.username, 
            email: existingUser.email 
          });
          
          const response = NextResponse.json(
            { message: 'Access granted', user: { id: existingUser._id, username: existingUser.username, email } },
            { status: 200 }
          );
          response.cookies.set('token', accessToken, {
            httpOnly: true,
            maxAge: 60 * 60 * 1000,
          });
          return response;
        }
      }
      const response = NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
      response.cookies.set('token', '', { maxAge: 0 });
      return response;
    }

    if (!username) {
      return NextResponse.json({ error: 'Username is required for signup' }, { status: 400 });
    }

    const userExists = await UserModel.findOne({ email });
    if (userExists) {
      return NextResponse.json({ error: 'User already exists with this email' }, { status: 409 });
    }

    const hashedPassword = password ? await hashPassword(password) : undefined;
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
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Operation failed', details: "eror" }, { status: 500 });
  }
}
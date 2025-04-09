import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, verifyToken, signToken, signRefreshToken, setCookie } from '@/app/Backend/lib/auth/auth';
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
      try {
        const decoded = verifyToken(token);
        if (decoded && typeof decoded !== 'string' && 'email' in decoded) {
          const existingUser = await UserModel.findOne({ email });
          if (existingUser) {
            const accessToken = signToken({ 
              id: existingUser._id, 
              username: existingUser.username, 
              email: existingUser.email 
            });
            const refreshToken = signRefreshToken({
              id: existingUser._id,
              username: existingUser.username,
              email: existingUser.email
            });

            let response = NextResponse.json(
              { message: 'Access granted', user: { id: existingUser._id, username: existingUser.username, email } },
              { status: 200 }
            );
            response = setCookie(response, accessToken, refreshToken);
            return response;
          }
        }
      } catch (err) {
        console.log('Token verification failed, proceeding with signup:', err);
      }
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
    const refreshToken = signRefreshToken({ id: newUser._id, username, email });

    let response = NextResponse.json(
      { message: 'Signup successful', user: { id: newUser._id, username, email } },
      { status: 201 }
    );
    response = setCookie(response, accessToken, refreshToken);

    return response;

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Operation failed', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
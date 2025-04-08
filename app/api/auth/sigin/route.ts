import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/app/Backend/models/UserModel';
import { signToken, comparePassword } from '@/app/Backend/lib/auth/auth';


export async function POST(req: NextRequest) {
  try {
    const { usernameOrEmail, password } = await req.json();

    if (!usernameOrEmail || !password) {
      return NextResponse.json(
        { error: 'Missing username/email or password' }, 
        { status: 400 }
      );
    }

    // Search for user by either email or username using $or operator
    const user = await UserModel.findOne({
      $or: [
        { email: usernameOrEmail },
        { username: usernameOrEmail }
      ]
    });

    if (!user || !(await comparePassword(password, user.password))) {
      return NextResponse.json(
        { error: 'Wrong credentials' }, 
        { status: 401 }
      );
    }

    const token = signToken({ id: user._id, email: user.email, username: user.username });
    const response = NextResponse.json(
      { 
        message: 'Logged in', 
        user: { 
          id: user._id, 
          email: user.email,
          username: user.username 
        } 
      },
      { status: 200 }
    );
    
    response.cookies.set('token', token, { 
      httpOnly: true,
      maxAge: 60 * 60 * 1000 // 1 hour
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Login failed' }, 
      { status: 500 }
    );
  }
}
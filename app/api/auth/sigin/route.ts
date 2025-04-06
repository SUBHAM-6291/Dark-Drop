import { NextRequest, NextResponse } from 'next/server';
import { UserModel } from '@/app/Backend/models/UserModel';
import { signToken, comparePassword } from '@/app/Backend/lib/auth/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    const user = await UserModel.findOne({ email });
    if (!user || !(await comparePassword(password, user.password))) {
      return NextResponse.json({ error: 'Wrong email or password' }, { status: 401 });
    }

    const token = signToken({ id: user._id, email });
    const response = NextResponse.json(
      { message: 'Logged in', user: { id: user._id, email } },
      { status: 200 }
    );
    
    response.cookies.set('token', token, { 
      httpOnly: true,
      maxAge: 60 * 60 * 1000
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
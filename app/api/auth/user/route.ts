import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/app/Backend/DB/DB';
import { UserModel } from '@/app/Backend/models/UserModel';
import { UserImagesModel } from '@/app/Backend/models/url.model';
import { verifyToken, hashPassword } from '@/app/Backend/lib/auth/auth';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === 'string' || !('id' in decoded)) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    await connectDB();
    const user = await UserModel.findById(decoded.id).select('-password');
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ 
      user: {
        username: user.username,
        email: user.email,
      }
    });
  } catch (error) {
    console.error('GET user error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token);
    if (!decoded || typeof decoded === 'string' || !('id' in decoded)) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { username, email, password } = await req.json();

    if (!username || !email) {
      return NextResponse.json({ error: 'Username and email are required' }, { status: 400 });
    }

    await connectDB();

    const currentUser = await UserModel.findById(decoded.id).select('email');
    if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const emailChanged = currentUser.email !== email;

    const updateData: any = { username, email };
    if (password) updateData.password = await hashPassword(password);

    const user = await UserModel.findByIdAndUpdate(
      decoded.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (emailChanged) {
      const userImages = await UserImagesModel.findOneAndUpdate(
        { email: currentUser.email },
        { email: email },
        { new: true, upsert: true }
      );
      if (!userImages) {
        console.error('Failed to update or create UserImages document');
      }
    }

    return NextResponse.json({ 
      message: 'Profile updated',
      user: { 
        username: user.username, 
        email: user.email,
      }
    });
  } catch (error) {
    console.error('PUT user error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
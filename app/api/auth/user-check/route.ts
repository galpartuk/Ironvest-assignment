import { NextRequest, NextResponse } from 'next/server';
import { findUserById } from '@/lib/db';

type Mode = 'login' | 'register';

interface CheckRequestBody {
  email?: string;
  mode?: Mode;
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckRequestBody = await request.json();
    const { email, mode } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    if (mode !== 'login' && mode !== 'register') {
      return NextResponse.json(
        { success: false, error: 'Mode must be "login" or "register"' },
        { status: 400 }
      );
    }

    const existing = await findUserById(email);

    if (mode === 'login') {
      if (!existing) {
        return NextResponse.json(
          { success: false, error: 'User does not exist. Please register first.' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, exists: true });
    }

    // mode === 'register'
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'A user with this email is already enrolled.' },
        { status: 409 }
      );
    }

    return NextResponse.json({ success: true, exists: false });
  } catch (error: any) {
    console.error('User check error', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}


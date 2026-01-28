import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookieName, verifyAuthToken } from '@/lib/jwt';
import { findUserById } from '@/lib/db';
import type { AuthResponse } from '@/types/auth';

export async function GET(request: NextRequest) {
  try {
    const cookieName = getAuthCookieName();
    const token = request.cookies.get(cookieName)?.value;

    if (!token) {
      return NextResponse.json<AuthResponse>({ success: false }, { status: 401 });
    }

    const payload = verifyAuthToken(token);
    if (!payload?.sub) {
      return NextResponse.json<AuthResponse>({ success: false }, { status: 401 });
    }

    const record = await findUserById(payload.sub);
    if (!record) {
      return NextResponse.json<AuthResponse>({ success: false }, { status: 401 });
    }

    return NextResponse.json<AuthResponse>({
      success: true,
      user: {
        id: record.id,
        email: record.id,
        isEnrolled: true,
        createdAt: record.created_at,
      },
    });
  } catch (error: any) {
    console.error('/api/auth/me error', error);
    return NextResponse.json<AuthResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}


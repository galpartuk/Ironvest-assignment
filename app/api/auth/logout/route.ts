import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookieName } from '@/lib/jwt';

export async function POST(_request: NextRequest) {
  const response = NextResponse.json({ success: true });

  // Clear the auth token cookie by setting it expired.
  response.cookies.set(getAuthCookieName(), '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}


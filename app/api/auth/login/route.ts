import { NextRequest, NextResponse } from 'next/server';
import { AuthResponse } from '@/types/auth';
import { validateActionIDSession } from '@/lib/actionid-server';
import { getActionIDFriendlyError } from '@/lib/actionid-errors';
import { findUserById } from '@/lib/db';
import { signAuthToken, getAuthCookieName } from '@/lib/jwt';

// No mock user storage: success is based on ActionID validation only.

export async function POST(request: NextRequest) {
  try {
    const body: { email?: string; csid?: string } = await request.json();
    const { email, csid } = body;

    // Validation
    if (!email) {
      return NextResponse.json<AuthResponse>(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }
    if (!csid) {
      return NextResponse.json<AuthResponse>(
        { success: false, error: 'Missing ActionID session (csid)' },
        { status: 400 }
      );
    }

    try {
      const validation = await validateActionIDSession({
        csid,
        uid: email,
        action: 'login',
        // For login we currently disable auto-enrollment and require an existing profile.
        enrollment: false,
      });

      // Always log the validation result for observability.
      console.log('ActionID login validation result', {
        email,
        validation,
      });

      if (!validation.verifiedAction) {
        console.warn('ActionID login validation failed', {
          email,
          validation,
        });
        const message = getActionIDFriendlyError(validation);
        return NextResponse.json<AuthResponse>(
          { success: false, error: message },
          { status: 401 }
        );
      }
    } catch (err: any) {
      console.error('ActionID validate (login) failed', err);
      return NextResponse.json<AuthResponse>(
        { success: false, error: `ActionID error: ${err.message || 'validate failed'}` },
        { status: 500 }
      );
    }

    // Ensure the user exists in our local database before completing login.
    const existing = await findUserById(email);
    if (!existing) {
      return NextResponse.json<AuthResponse>(
        { success: false, error: 'User does not exist. Please register first.' },
        { status: 404 }
      );
    }

    const token = signAuthToken(email);
    const response = NextResponse.json<AuthResponse>({
      success: true,
      user: {
        id: email,
        email,
        isEnrolled: true,
        createdAt: existing.created_at,
      },
    });

    response.cookies.set(getAuthCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60, // 1 hour
    });

    return response;
  } catch (error: any) {
    console.error('Login error', error);
    return NextResponse.json<AuthResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

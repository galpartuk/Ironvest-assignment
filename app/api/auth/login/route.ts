import { NextRequest, NextResponse } from 'next/server';
import { AuthResponse } from '@/types/auth';
import { validateActionIDSession } from '@/lib/actionid-server';
import { getActionIDFriendlyError } from '@/lib/actionid-errors';

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
        enrollment: true,
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

    // No DB yet: just return a user object keyed by email.
    return NextResponse.json<AuthResponse>({
      success: true,
      user: {
        id: email,
        email,
        isEnrolled: true,
      },
    });
  } catch (error: any) {
    console.error('Login error', error);
    return NextResponse.json<AuthResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

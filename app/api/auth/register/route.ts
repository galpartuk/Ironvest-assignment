import { NextRequest, NextResponse } from 'next/server';
import { AuthResponse } from '@/types/auth';
import { validateActionIDSession } from '@/lib/actionid-server';
import { getActionIDFriendlyError } from '@/lib/actionid-errors';

// Register endpoint: creates a new user only after biometric capture (Step 2).
// Flow: form (Step 1) → biometric capture → POST here with biometricEnrolled + csid → user created.
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
        // For registration we use the recommended enrollment action name.
        action: 'user_enrollment',
        enrollment: true,
      });
      if (!validation.verifiedAction) {
        // Log full validation payload for observability/debugging.
        console.warn('ActionID registration validation failed', {
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
      console.error('ActionID validate (register) failed', err);
      return NextResponse.json<AuthResponse>(
        { success: false, error: `ActionID error: ${err.message || 'validate failed'}` },
        { status: 500 }
      );
    }

    // For now we don't persist a DB; we just return the validated user.
    return NextResponse.json<AuthResponse>({
      success: true,
      user: {
        id: email,
        email,
        isEnrolled: true,
      },
    });
  } catch (error: any) {
    console.error('Register error', error);
    return NextResponse.json<AuthResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

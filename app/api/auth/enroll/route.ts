import { NextRequest, NextResponse } from 'next/server';
import { AuthResponse } from '@/types/auth';
import { validateActionIDSession } from '@/lib/actionid-server';
import { getActionIDFriendlyError } from '@/lib/actionid-errors';

// Enroll endpoint: for existing logged-in users adding biometrics (e.g. /enroll page).
// Separate from register: register creates the user; enroll updates an existing user.
// No mock user storage: success is based on ActionID validation only.

export async function POST(request: NextRequest) {
  try {
    const body: { uid?: string; csid?: string } = await request.json();
    const { uid, csid } = body;

    // Validation
    if (!uid) {
      return NextResponse.json<AuthResponse>(
        { success: false, error: 'User (uid/email) is required' },
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
        uid,
        // Enrollment flow also uses 'user_enrollment'
        action: 'user_enrollment',
        enrollment: true,
      });
      if (!validation.verifiedAction) {
        console.warn('ActionID enroll validation failed', {
          uid,
          validation,
        });
        const message = getActionIDFriendlyError(validation);
        return NextResponse.json<AuthResponse>(
          { success: false, error: message },
          { status: 401 }
        );
      }
    } catch (err: any) {
      console.error('ActionID validate (enroll) failed', err);
      return NextResponse.json<AuthResponse>(
        { success: false, error: `ActionID error: ${err.message || 'validate failed'}` },
        { status: 500 }
      );
    }

    // No DB yet: just return enrolled user keyed by uid.
    return NextResponse.json<AuthResponse>({
      success: true,
      user: {
        id: uid,
        email: uid,
        isEnrolled: true,
      },
    });
  } catch (error: any) {
    console.error('Enroll error', error);
    return NextResponse.json<AuthResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

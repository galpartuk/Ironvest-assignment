import { NextRequest, NextResponse } from 'next/server';
import { AuthResponse } from '@/types/auth';
import { validateActionIDSession } from '@/lib/actionid-server';
import { getActionIDFriendlyError } from '@/lib/actionid-errors';
import { createUserRecord, findUserById, insertAuditLog } from '@/lib/db';
import { signAuthToken, getAuthCookieName } from '@/lib/jwt';

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

    // Check if the user already exists before we trigger a biometric enrollment.
    const existing = await findUserById(email);
    if (existing) {
      return NextResponse.json<AuthResponse>(
        { success: false, error: 'A user with this email is already enrolled.' },
        { status: 409 }
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

      // Persist an audit entry for this ActionID call.
      await insertAuditLog({
        userId: email,
        action: 'register',
        verifiedAction: !!validation.verifiedAction,
        ivScore: validation.ivScore,
        indicators: validation.indicators,
      });

      // Always log the full validation payload for observability.
      console.log('ActionID registration validation result', {
        email,
        validation,
      });

      if (!validation.verifiedAction) {
        // Highlight failed validations separately.
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

    // Persist the enrolled user to the database.
    const record = await createUserRecord(email);

    const token = signAuthToken(email);
    const response = NextResponse.json<AuthResponse>({
      success: true,
      user: {
        id: email,
        email,
        isEnrolled: true,
        createdAt: record.created_at,
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
    console.error('Register error', error);
    return NextResponse.json<AuthResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

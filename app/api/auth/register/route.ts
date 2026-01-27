import { NextRequest, NextResponse } from 'next/server';
import { AuthResponse } from '@/types/auth';

// Mock user database (in real app, this would be a database)
const mockUsers: Array<{ id: string; email: string; password: string; isEnrolled: boolean }> = [
  { id: '1', email: 'test@example.com', password: 'password123', isEnrolled: false },
];

export async function POST(request: NextRequest) {
  try {
    const body: { email: string; password: string; biometricEnrolled?: boolean } = await request.json();
    const { email, password, biometricEnrolled } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json<AuthResponse>(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json<AuthResponse>(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Require biometric enrollment before creating user
    if (!biometricEnrolled) {
      return NextResponse.json<AuthResponse>(
        { success: false, error: 'Biometric enrollment is required to create an account' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === email);
    if (existingUser) {
      return NextResponse.json<AuthResponse>(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user only after successful biometric enrollment
    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      isEnrolled: true, // User is enrolled since biometric enrollment succeeded
    };

    mockUsers.push(newUser);

    // Return user (without password)
    return NextResponse.json<AuthResponse>({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        isEnrolled: newUser.isEnrolled,
      },
    });
  } catch (error) {
    return NextResponse.json<AuthResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

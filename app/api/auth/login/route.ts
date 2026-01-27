import { NextRequest, NextResponse } from 'next/server';
import { AuthResponse, LoginCredentials } from '@/types/auth';

// Mock user database (in real app, this would be a database)
const mockUsers: Array<{ id: string; email: string; password: string; isEnrolled: boolean }> = [
  { id: '1', email: 'test@example.com', password: 'password123', isEnrolled: false },
];

export async function POST(request: NextRequest) {
  try {
    const body: LoginCredentials = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json<AuthResponse>(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = mockUsers.find((u) => u.email === email && u.password === password);

    if (!user) {
      return NextResponse.json<AuthResponse>(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Return user (without password)
    return NextResponse.json<AuthResponse>({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        isEnrolled: user.isEnrolled,
      },
    });
  } catch (error) {
    return NextResponse.json<AuthResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

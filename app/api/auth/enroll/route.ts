import { NextRequest, NextResponse } from 'next/server';
import { AuthResponse } from '@/types/auth';

// Mock user database (in real app, this would be a database)
const mockUsers: Array<{ id: string; email: string; password: string; isEnrolled: boolean }> = [
  { id: '1', email: 'test@example.com', password: 'password123', isEnrolled: false },
];

export async function POST(request: NextRequest) {
  try {
    const body: { userId?: string } = await request.json();
    const { userId } = body;

    // Validation
    if (!userId) {
      return NextResponse.json<AuthResponse>(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Find user
    const user = mockUsers.find((u) => u.id === userId);

    if (!user) {
      return NextResponse.json<AuthResponse>(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Update enrollment status
    // In phase 2, this will integrate with ActionID SDK
    user.isEnrolled = true;

    // Return updated user
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

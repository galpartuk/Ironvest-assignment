import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookieName, verifyAuthToken } from '@/lib/jwt';
import { getRecentAuditLogsForUser } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const cookieName = getAuthCookieName();
    const token = request.cookies.get(cookieName)?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const payload = verifyAuthToken(token);
    if (!payload?.sub) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const entries = await getRecentAuditLogsForUser(payload.sub, 20);

    return NextResponse.json({
      success: true,
      logs: entries,
    });
  } catch (error: any) {
    console.error('/api/auth/audit-logs error', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}


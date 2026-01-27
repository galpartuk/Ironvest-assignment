import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname;

  // Protect the /home route
  if (path.startsWith('/home')) {
    // Check for auth token in cookies or headers
    // For now, we'll let the page handle the redirect since we're using client-side auth
    // In a production app, you'd verify a JWT token here
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/home/:path*'],
};

import jwt from 'jsonwebtoken';

const TOKEN_COOKIE_NAME = 'auth_token';
const DEFAULT_EXPIRY_SECONDS = 60 * 60; // 1 hour

// Hardcoded secret for JWT signing (used for session tokens)
const AUTH_TOKEN_SECRET = '6c5b1f1c9a4e4a3f8b2e7d94c1a3f5e2d7c9b6a184f2c7d3e9b1a4c7f2d8e3b';

function getSecret(): string {
  return AUTH_TOKEN_SECRET;
}

export interface AuthTokenPayload {
  sub: string; // user id / email
  iat?: number;
  exp?: number;
}

export function signAuthToken(userId: string, expiresInSeconds: number = DEFAULT_EXPIRY_SECONDS): string {
  const secret = getSecret();
  return jwt.sign({ sub: userId } as AuthTokenPayload, secret, {
    algorithm: 'HS256',
    expiresIn: expiresInSeconds,
  });
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    const secret = getSecret();
    const decoded = jwt.verify(token, secret) as AuthTokenPayload;
    if (typeof decoded.sub !== 'string') return null;
    return decoded;
  } catch {
    return null;
  }
}

export function getAuthCookieName() {
  return TOKEN_COOKIE_NAME;
}


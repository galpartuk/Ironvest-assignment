import jwt from 'jsonwebtoken';

const TOKEN_COOKIE_NAME = 'auth_token';
const DEFAULT_EXPIRY_SECONDS = 60 * 60; // 1 hour

function getSecret(): string {
  const secret = process.env.AUTH_TOKEN_SECRET;
  if (!secret) {
    throw new Error('Missing env var: AUTH_TOKEN_SECRET');
  }
  return secret;
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


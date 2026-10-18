import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { User, AuthTokenPayload } from '@cardealer/types';

if (
  process.env.NODE_ENV === 'production' &&
  (!process.env.API_SECRET_KEY || process.env.API_SECRET_KEY.length < 32)
) {
  throw new Error(
    'CRITICAL SECURITY ERROR: API_SECRET_KEY must be configured with at least 32 characters in production.'
  );
}

export const JWT_SECRET =
  process.env.API_SECRET_KEY || 'cardealer_super_secret_jwt_key_2026_at_least_32_chars';

export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch {
    return null;
  }
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function parseCookies(cookieHeader?: string): Record<string, string> {
  const list: Record<string, string> = {};
  if (!cookieHeader) return list;

  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const name = parts.shift()?.trim();
    if (name) {
      list[name] = decodeURI(parts.join('='));
    }
  });

  return list;
}

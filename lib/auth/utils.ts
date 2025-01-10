import { SignJWT, jwtVerify } from 'jose';
import { createHash } from 'crypto';
import { sessionStore } from './sessions';
import { db } from '../db/users';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export async function hashPassword(password: string): Promise<string> {
  return createHash('sha256')
    .update(password)
    .digest('hex');
}

export async function createToken(userId: string): Promise<{ token: string, sessionId: string }> {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(JWT_SECRET);

  const session = await sessionStore.createSession(userId, token);
  return { token, sessionId: session.id };
}

export async function verifyAuth(token: string, sessionId: string) {
  const session = await sessionStore.getSession(sessionId);
  if (!session || session.token !== token) {
    throw new Error('Invalid session');
  }

  const verified = await jwtVerify(token, JWT_SECRET);
  return verified.payload;
}

export async function invalidateSession(sessionId: string) {
  await sessionStore.invalidateSession(sessionId);
} 
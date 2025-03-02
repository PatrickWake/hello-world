import { SignJWT, jwtVerify } from 'jose';
import { SessionStore } from './sessions';
import { db } from '../db';

const sessionStore = new SessionStore(db);

export async function createToken(userId: string): Promise<{ token: string; sessionId: string }> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);

  const session = await sessionStore.createSession(userId, token);
  return { token, sessionId: session.id };
}

export async function verifyAuth(token: string, sessionId: string): Promise<boolean> {
  try {
    const session = await sessionStore.getSession(sessionId);
    if (!session || session.token !== token) {
      return false;
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export async function refreshToken(userId: string, oldSessionId: string): Promise<{ token: string; sessionId: string }> {
  await sessionStore.deleteSession(oldSessionId);
  return createToken(userId);
}

export async function revokeSession(sessionId: string): Promise<void> {
  await sessionStore.deleteSession(sessionId);
} 
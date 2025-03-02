import { SignJWT, jwtVerify } from 'jose';
import { SessionStore, sessionStore } from './sessions';

export async function createToken(userId: string): Promise<{ token: string; sessionId: string }> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-for-development');
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);

  const sessionId = await sessionStore.createSession(userId, token);
  return { token, sessionId };
}

export async function verifyAuth(token: string): Promise<any> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-for-development');
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export async function verifySessionAuth(token: string, sessionId: string): Promise<boolean> {
  try {
    const session = await sessionStore.getSession(sessionId);
    if (!session || session.token !== token) {
      return false;
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-for-development');
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

// Password hashing functions
export async function hashPassword(password: string): Promise<string> {
  // In a real app, use bcrypt or argon2
  // This is a simple placeholder
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function comparePasswords(plaintext: string, hashed: string): Promise<boolean> {
  const hashedInput = await hashPassword(plaintext);
  return hashedInput === hashed;
} 
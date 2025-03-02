import { db } from '../../lib/db/users';
import { createToken } from '../../lib/auth/utils';
import { UserRole } from '../../lib/auth/roles';
import type { NextApiRequest, NextApiResponse } from 'next';

export async function createTestUser(role: UserRole = UserRole.USER) {
  const email = `test-${Math.random()}@example.com`;
  const user = db.createUser(email, 'password123');
  db.updateUserRole(user.id, role);
  const { token, sessionId } = await createToken(user.id);
  
  return {
    user,
    token,
    sessionId
  };
}

export function createMockRequest(options: {
  method?: string;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
  body?: any;
  query?: Record<string, string>;
} = {}): NextApiRequest {
  return {
    method: options.method || 'GET',
    headers: {
      'content-type': 'application/json',
      ...options.headers,
    },
    cookies: options.cookies || {},
    body: options.body || {},
    query: options.query || {},
    env: {},
    socket: {
      destroy: jest.fn(),
      setTimeout: jest.fn(),
      setNoDelay: jest.fn(),
      setKeepAlive: jest.fn(),
    } as any,
  } as NextApiRequest;
}

export function createMockResponse(): NextApiResponse {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    setHeader: jest.fn(),
    getHeader: jest.fn(),
    end: jest.fn(),
  };
  return res as unknown as NextApiResponse;
} 
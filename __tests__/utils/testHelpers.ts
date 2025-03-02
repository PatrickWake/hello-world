import { NextApiRequest, NextApiResponse } from 'next';
import { MockDB } from './mock-db';

export const testDB = new MockDB();

// Mock the global DB object
global.DB = testDB;

export function createTestUser(role: UserRole = UserRole.USER) {
  const email = `test-${Math.random()}@example.com`;
  const user = testDB.createUser(email, 'password123');
  testDB.updateUserRole(user.id, role);
  const { token, sessionId } = await createToken(user.id);
  
  return {
    user,
    token,
    sessionId
  };
}

export function createMockRequest(overrides = {}) {
  return {
    method: 'GET',
    headers: {},
    cookies: {},
    body: {},
    query: {},
    ...overrides
  } as NextApiRequest;
}

export function createMockResponse() {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    setHeader: jest.fn(),
  } as unknown as NextApiResponse;
  return res;
} 
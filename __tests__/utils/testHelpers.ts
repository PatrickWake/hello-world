import { db } from '../../lib/db/users';
import { createToken } from '../../lib/auth/utils';
import { UserRole } from '../../lib/auth/roles';

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

export function createMockRequest(overrides = {}) {
  return {
    headers: {},
    cookies: {},
    body: {},
    method: 'GET',
    ...overrides
  };
}

export function createMockResponse() {
  const res: any = {
    statusCode: 200,
    headers: new Map(),
    cookies: new Map(),
    status: function(code: number) {
      this.statusCode = code;
      return this;
    },
    json: jest.fn(),
    setHeader: function(key: string, value: string) {
      this.headers.set(key, value);
    },
    getHeader: function(key: string) {
      return this.headers.get(key);
    }
  };
  return res;
} 
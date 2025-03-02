import { createTestUser, createMockRequest, createMockResponse } from '../utils/testHelpers';
import { UserRole } from '../../lib/auth/roles';
import { db } from '../../lib/db/users';

describe('API Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should maintain session across requests', async () => {
    const { user, token, sessionId } = await createTestUser();
    const req = createMockRequest({
      headers: {
        authorization: `Bearer ${token}`,
        cookie: `sessionId=${sessionId}`
      }
    });

    // Test protected endpoint
    const response = await fetch('/api/protected', {
      headers: req.headers
    });

    expect(response.status).toBe(200);
    
    // Test session persistence
    const secondResponse = await fetch('/api/protected', {
      headers: req.headers
    });
    
    expect(secondResponse.status).toBe(200);
  });

  it('should handle role-based access correctly', async () => {
    const { user, token, sessionId } = await createTestUser(UserRole.ADMIN);
    const req = createMockRequest({
      headers: {
        authorization: `Bearer ${token}`,
        cookie: `sessionId=${sessionId}`
      }
    });

    // Test admin endpoint
    const response = await fetch('/api/admin/users', {
      headers: req.headers
    });

    expect(response.status).toBe(200);

    // Test regular user access denial
    const regularUser = await createTestUser(UserRole.USER);
    const regularReq = createMockRequest({
      headers: {
        authorization: `Bearer ${regularUser.token}`,
        cookie: `sessionId=${regularUser.sessionId}`
      }
    });

    const deniedResponse = await fetch('/api/admin/users', {
      headers: regularReq.headers
    });

    expect(deniedResponse.status).toBe(403);
  });

  it('should enforce rate limits across endpoints', async () => {
    const { token, sessionId } = await createTestUser();
    const headers = {
      authorization: `Bearer ${token}`,
      cookie: `sessionId=${sessionId}`
    };

    const requests = Array(60).fill(null).map(() => 
      fetch('/api/protected', { headers })
    );

    const responses = await Promise.all(requests);
    const rateLimited = responses.some(r => r.status === 429);
    expect(rateLimited).toBe(true);
  });

  it('should handle session expiration', async () => {
    const { token, sessionId } = await createTestUser();
    
    // Mock expired session
    jest.spyOn(db, 'getSession').mockResolvedValueOnce({
      id: sessionId,
      token,
      expiresAt: new Date(Date.now() - 1000).toISOString() // expired
    });

    const response = await fetch('/api/protected', {
      headers: {
        authorization: `Bearer ${token}`,
        cookie: `sessionId=${sessionId}`
      }
    });

    expect(response.status).toBe(401);
  });
}); 
import { createTestUser, createMockRequest, createMockResponse } from '../utils/testHelpers';
import { UserRole } from '../../lib/auth/roles';

describe('API Integration', () => {
  it('should maintain session across requests', async () => {
    const { user, token, sessionId } = await createTestUser();
    const req = createMockRequest({
      headers: {
        authorization: `Bearer ${token}`,
        cookie: `sessionId=${sessionId}`
      }
    });
    const res = createMockResponse();

    // Test protected endpoint
    const response = await fetch('/api/protected', {
      headers: req.headers
    });

    expect(response.status).toBe(200);
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
  });

  it('should enforce rate limits across endpoints', async () => {
    const { token } = await createTestUser();
    const requests = Array(60).fill(null).map(() => 
      fetch('/api/protected', {
        headers: {
          authorization: `Bearer ${token}`
        }
      })
    );

    const responses = await Promise.all(requests);
    const rateLimited = responses.some(r => r.status === 429);
    expect(rateLimited).toBe(true);
  });
}); 
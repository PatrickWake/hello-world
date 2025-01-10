import { createTestUser, createMockRequest, createMockResponse } from '../utils/testHelpers';
import handler from '../../pages/api/auth/signin';
import { db } from '../../lib/db/users';

describe('Authentication', () => {
  it('should successfully sign in with valid credentials', async () => {
    const email = 'test@example.com';
    const password = 'password123';
    db.createUser(email, password);

    const req = createMockRequest({
      method: 'POST',
      body: { email, password }
    });
    const res = createMockResponse();

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        token: expect.any(String),
        user: expect.objectContaining({ email })
      })
    );
  });

  it('should reject invalid credentials', async () => {
    const req = createMockRequest({
      method: 'POST',
      body: {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      }
    });
    const res = createMockResponse();

    await handler(req, res);

    expect(res.statusCode).toBe(401);
  });

  it('should enforce rate limiting', async () => {
    const req = createMockRequest({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'password123'
      }
    });

    const res = createMockResponse();

    // Attempt multiple requests
    for (let i = 0; i < 6; i++) {
      await handler(req, res);
    }

    expect(res.statusCode).toBe(429);
  });
}); 
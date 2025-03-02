import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/auth/signin';

// Mock the entire auth utils module
jest.mock('@/lib/auth/utils', () => ({
  generateToken: jest.fn().mockReturnValue('mock-token'),
  verifyToken: jest.fn().mockResolvedValue(true)
}));

// Mock the users module
jest.mock('@/lib/db/users', () => ({
  getUserByEmail: jest.fn(),
  validateUserPassword: jest.fn()
}));

describe('/api/auth/signin', () => {
  it('returns 400 for missing email or password', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {},
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Email and password are required'
    });
  });

  it('returns 401 for invalid credentials', async () => {
    const { getUserByEmail, validateUserPassword } = require('@/lib/db/users');
    getUserByEmail.mockResolvedValue({ id: '1', email: 'test@example.com' });
    validateUserPassword.mockResolvedValue(false);

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'wrong-password'
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(401);
    expect(JSON.parse(res._getData())).toEqual({
      error: 'Invalid credentials'
    });
  });

  it('returns token for valid credentials', async () => {
    const { getUserByEmail, validateUserPassword } = require('@/lib/db/users');
    getUserByEmail.mockResolvedValue({ id: '1', email: 'test@example.com' });
    validateUserPassword.mockResolvedValue(true);

    const { req, res } = createMocks({
      method: 'POST',
      body: {
        email: 'test@example.com',
        password: 'correct-password'
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      token: 'mock-token'
    });
  });
}); 
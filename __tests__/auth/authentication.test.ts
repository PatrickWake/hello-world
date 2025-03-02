import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../pages/api/auth/signin';
import { createMockRequest, createMockResponse } from '../utils/testHelpers';

describe('Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully sign in with valid credentials', async () => {
    const mockReq = {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      cookies: {},
      body: {
        email: 'test@example.com',
        password: 'password123'
      },
      query: {},
      // Add other required NextApiRequest properties
      env: {},
      socket: {
        destroy: jest.fn(),
        setTimeout: jest.fn(),
        setNoDelay: jest.fn(),
        setKeepAlive: jest.fn(),
      } as any,
    } as NextApiRequest;

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
    } as unknown as NextApiResponse;

    await handler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        token: expect.any(String),
        user: expect.objectContaining({
          email: 'test@example.com',
        })
      })
    );
  });

  it('should reject invalid credentials', async () => {
    const mockReq = {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      cookies: {},
      body: {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      },
      query: {},
      env: {},
      socket: {
        destroy: jest.fn(),
        setTimeout: jest.fn(),
        setNoDelay: jest.fn(),
        setKeepAlive: jest.fn(),
      } as any,
    } as NextApiRequest;

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
    } as unknown as NextApiResponse;

    await handler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(401);
  });

  it('should enforce rate limiting', async () => {
    const mockReq = {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      cookies: {},
      body: {
        email: 'test@example.com',
        password: 'password123'
      },
      query: {},
      env: {},
      socket: {
        destroy: jest.fn(),
        setTimeout: jest.fn(),
        setNoDelay: jest.fn(),
        setKeepAlive: jest.fn(),
      } as any,
    } as NextApiRequest;

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
    } as unknown as NextApiResponse;

    // Attempt multiple requests
    for (let i = 0; i < 6; i++) {
      await handler(mockReq, mockRes);
    }

    expect(mockRes.status).toHaveBeenCalledWith(429);
  });

  it('should set proper auth cookies', async () => {
    const mockReq = {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      cookies: {},
      body: {
        email: 'test@example.com',
        password: 'password123'
      },
      query: {},
      env: {},
      socket: {
        destroy: jest.fn(),
        setTimeout: jest.fn(),
        setNoDelay: jest.fn(),
        setKeepAlive: jest.fn(),
      } as any,
    } as NextApiRequest;

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
      getHeader: jest.fn(),
    } as unknown as NextApiResponse;

    await handler(mockReq, mockRes);

    expect(mockRes.setHeader).toHaveBeenCalledWith(
      'Set-Cookie',
      expect.arrayContaining([
        expect.stringContaining('sessionId='),
        expect.stringContaining('authToken=')
      ])
    );
  });
}); 
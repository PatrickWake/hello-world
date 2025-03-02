import type { NextApiRequest, NextApiResponse } from 'next';
import handler from '../../../pages/api/auth/signin';
import { createMockRequest, createMockResponse } from '../../utils/testHelpers';

describe('Sign In API Endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully sign in with valid credentials', async () => {
    const mockReq = {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: {
        email: 'test@example.com',
        password: 'password123'
      },
      cookies: {},
      query: {},
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
      headers: { 'content-type': 'application/json' },
      body: {
        email: 'test@example.com',
        password: 'wrong_password'
      },
      cookies: {},
      query: {},
    } as NextApiRequest;

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
    } as unknown as NextApiResponse;

    await handler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.any(String)
      })
    );
  });

  it('should reject non-POST requests', async () => {
    const mockReq = {
      method: 'GET',
      headers: { 'content-type': 'application/json' },
      cookies: {},
      query: {},
    } as NextApiRequest;

    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      setHeader: jest.fn(),
    } as unknown as NextApiResponse;

    await handler(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(405);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'Method not allowed'
      })
    );
  });
}); 
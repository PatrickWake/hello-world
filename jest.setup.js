import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock jose for JWT handling
jest.mock('jose', () => ({
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue('mocked_jwt_token'),
  })),
  jwtVerify: jest.fn().mockResolvedValue({
    payload: { sub: 'test_user_id' },
  }),
}));

// Mock express-rate-limit
jest.mock('express-rate-limit', () => ({
  __esModule: true,
  default: jest.fn(() => (req, res, next) => next()),
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

// Mock auth utilities
jest.mock('./lib/auth/utils', () => ({
  createToken: jest.fn().mockResolvedValue({ 
    token: 'test_token', 
    sessionId: 'test_session' 
  }),
  verifyAuth: jest.fn().mockResolvedValue(true),
  refreshToken: jest.fn().mockResolvedValue({
    token: 'new_test_token',
    sessionId: 'new_test_session'
  }),
  revokeSession: jest.fn().mockResolvedValue(undefined),
}));

// Set up environment variables
process.env.JWT_SECRET = 'test_secret'; 
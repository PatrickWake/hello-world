import { createTestUser, createMockRequest, createMockResponse } from '../utils/testHelpers';
import { rateLimit, securityHeaders } from '../../lib/security';
import { UserRole } from '../../lib/auth/roles';

describe('Security Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rate Limiting', () => {
    it('should limit requests based on IP', async () => {
      const req = createMockRequest({
        ip: '192.168.1.1',
        method: 'POST',
        url: '/api/auth/signin'
      });
      const res = createMockResponse();
      const next = jest.fn();

      // Simulate multiple requests
      for (let i = 0; i < 10; i++) {
        await rateLimit.auth(req, res, next);
      }

      expect(res.statusCode).toBe(429);
      expect(next).not.toHaveBeenCalled();
    });

    it('should have stricter limits for auth endpoints', async () => {
      const req = createMockRequest({
        ip: '192.168.1.2',
        method: 'POST',
        url: '/api/auth/signin'
      });
      const res = createMockResponse();
      const next = jest.fn();

      // Auth endpoints should have lower limits
      for (let i = 0; i < 5; i++) {
        await rateLimit.auth(req, res, next);
      }

      expect(res.statusCode).toBe(429);
    });
  });

  describe('Security Headers', () => {
    it('should set all required security headers', async () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      await securityHeaders(req, res, next);

      expect(res.getHeader('X-Frame-Options')).toBe('DENY');
      expect(res.getHeader('X-Content-Type-Options')).toBe('nosniff');
      expect(res.getHeader('X-XSS-Protection')).toBe('1; mode=block');
      expect(res.getHeader('Strict-Transport-Security')).toBe('max-age=31536000; includeSubDomains');
      expect(res.getHeader('Content-Security-Policy')).toBeDefined();
    });
  });

  describe('Token Security', () => {
    it('should detect token reuse attempts', async () => {
      const { token, sessionId } = await createTestUser();
      
      // First request should succeed
      const firstReq = createMockRequest({
        headers: {
          authorization: `Bearer ${token}`,
          cookie: `sessionId=${sessionId}`
        }
      });
      const firstRes = createMockResponse();
      
      await fetch('/api/protected', {
        headers: firstReq.headers
      });

      expect(firstRes.statusCode).toBe(200);

      // Simulate token being invalidated
      await db.invalidateSession(sessionId);

      // Second request with same token should fail
      const secondReq = createMockRequest({
        headers: {
          authorization: `Bearer ${token}`,
          cookie: `sessionId=${sessionId}`
        }
      });
      const secondRes = createMockResponse();

      await fetch('/api/protected', {
        headers: secondReq.headers
      });

      expect(secondRes.statusCode).toBe(401);
    });

    it('should prevent session fixation', async () => {
      const { token, sessionId } = await createTestUser();
      
      // Attempt to reuse session ID
      const maliciousReq = createMockRequest({
        headers: {
          cookie: `sessionId=${sessionId}`,
          authorization: 'Bearer malicious_token'
        }
      });
      const res = createMockResponse();

      await fetch('/api/protected', {
        headers: maliciousReq.headers
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('CSRF Protection', () => {
    it('should validate CSRF tokens', async () => {
      const { token, sessionId } = await createTestUser();
      const csrfToken = 'valid_csrf_token';

      const req = createMockRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          cookie: `sessionId=${sessionId}`,
          'x-csrf-token': csrfToken
        }
      });
      const res = createMockResponse();

      await fetch('/api/protected', {
        method: 'POST',
        headers: req.headers
      });

      expect(res.statusCode).toBe(200);
    });

    it('should reject requests with invalid CSRF tokens', async () => {
      const { token, sessionId } = await createTestUser();

      const req = createMockRequest({
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          cookie: `sessionId=${sessionId}`,
          'x-csrf-token': 'invalid_token'
        }
      });
      const res = createMockResponse();

      await fetch('/api/protected', {
        method: 'POST',
        headers: req.headers
      });

      expect(res.statusCode).toBe(403);
    });
  });
}); 
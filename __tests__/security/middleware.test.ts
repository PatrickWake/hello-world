import { withSecurity } from '../../lib/security';
import { createMockRequest, createMockResponse } from '../utils/testHelpers';

describe('Security Middleware', () => {
  it('should apply security headers', async () => {
    const handler = jest.fn();
    const wrapped = withSecurity(handler);
    const req = createMockRequest();
    const res = createMockResponse();

    await wrapped(req, res);

    expect(res.getHeader('X-Frame-Options')).toBe('DENY');
    expect(res.getHeader('X-XSS-Protection')).toBe('1; mode=block');
    expect(res.getHeader('X-Content-Type-Options')).toBe('nosniff');
  });

  it('should sanitize input', async () => {
    const handler = jest.fn();
    const wrapped = withSecurity(handler);
    const req = createMockRequest({
      body: {
        text: '<script>alert("xss")</script>Hello'
      }
    });
    const res = createMockResponse();

    await wrapped(req, res);

    expect(req.body.text).not.toContain('<script>');
  });

  it('should enforce rate limits', async () => {
    const handler = jest.fn();
    const wrapped = withSecurity(handler, { rateLimit: 'api' });
    const req = createMockRequest();
    const res = createMockResponse();

    // Make multiple requests
    for (let i = 0; i < 51; i++) {
      await wrapped(req, res);
    }

    expect(res.statusCode).toBe(429);
  });
}); 
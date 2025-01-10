import { NextApiRequest, NextApiResponse } from 'next';
import rateLimit from 'express-rate-limit';
import { sessionStore } from '../auth/sessions';

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Security headers
const securityHeaders = {
  'X-XSS-Protection': '1; mode=block',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};

export function withSecurity(handler: any) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Apply rate limiting
    await new Promise((resolve) => limiter(req, res, resolve));

    // Add security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Session validation for protected routes
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      const sessionId = req.cookies.sessionId;

      try {
        await verifyAuth(token, sessionId);
      } catch (error) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
    }

    return handler(req, res);
  };
} 
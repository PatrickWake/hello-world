import rateLimit from 'express-rate-limit';
import { NextApiRequest, NextApiResponse } from 'next';

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

const configs: Record<string, RateLimitConfig> = {
  default: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  auth: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5 // limit each IP to 5 login attempts per hour
  },
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50 // limit each IP to 50 requests per windowMs
  }
};

export function createRateLimiter(type: keyof typeof configs = 'default') {
  const config = configs[type];
  return rateLimit({
    windowMs: config.windowMs,
    max: config.max,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

export function withRateLimit(type: keyof typeof configs = 'default') {
  const limiter = createRateLimiter(type);
  
  return (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    return new Promise((resolve, reject) => {
      limiter(req, res, (result: any) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(next());
      });
    });
  };
} 
import { NextApiRequest } from 'next';
import xss from 'xss';

export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return xss(input);
  }
  
  if (Array.isArray(input)) {
    return input.map(item => sanitizeInput(item));
  }
  
  if (typeof input === 'object' && input !== null) {
    return Object.keys(input).reduce((acc, key) => ({
      ...acc,
      [key]: sanitizeInput(input[key])
    }), {});
  }
  
  return input;
}

export function withInputSanitization(
  handler: (req: NextApiRequest, ...args: any[]) => any
) {
  return async (req: NextApiRequest, ...args: any[]) => {
    if (req.body) {
      req.body = sanitizeInput(req.body);
    }
    if (req.query) {
      req.query = sanitizeInput(req.query);
    }
    return handler(req, ...args);
  };
} 
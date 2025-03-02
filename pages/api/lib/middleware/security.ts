import { NextApiRequest, NextApiResponse } from 'next';

export function validateRequest(req: NextApiRequest, res: NextApiResponse) {
  // Add your security validation logic here
  return true;
} 
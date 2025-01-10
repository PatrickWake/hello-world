import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db/users';
import { createToken } from '../../../lib/auth/utils';
import { withSecurity } from '../../../lib/security';
import { serialize } from 'cookie';

export const config = {
  runtime: 'edge',
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await db.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await db.createUser(email, password, name);
    const { token, sessionId } = await createToken(user.id);

    // Set cookies
    res.setHeader('Set-Cookie', [
      serialize('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/'
      }),
      serialize('sessionId', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60,
        path: '/'
      })
    ]);

    res.status(200).json({ user, token, sessionId });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export default withSecurity(handler, { rateLimit: 'auth' }); 
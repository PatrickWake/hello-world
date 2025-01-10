import type { NextApiRequest, NextApiResponse } from 'next';
import { withSecurity } from '../../../lib/middleware/security';
import { db } from '../../../lib/db/users';
import { createToken } from '../../../lib/auth/utils';
import { serialize } from 'cookie';

export const config = {
  runtime: 'edge',
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await db.findUserByEmail(email);
    if (!user || !(await db.validatePassword(user, password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const { token, sessionId } = await createToken(user.id);
    const { password: _, ...userWithoutPassword } = user;

    // Set both token and session cookies
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

    res.status(200).json({ 
      token, 
      sessionId,
      user: userWithoutPassword 
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export default withSecurity(handler, { rateLimit: 'auth' }); 
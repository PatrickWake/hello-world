import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '../../../lib/db/users';
import { createResetToken, sendResetEmail } from '../../../lib/auth/utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email } = req.body;
    const user = db.findUserByEmail(email);

    if (!user) {
      // Return 200 even if user doesn't exist for security
      return res.status(200).json({ message: 'If an account exists, a reset email has been sent' });
    }

    const resetToken = await createResetToken(user.id);
    await sendResetEmail(email, resetToken);

    res.status(200).json({ message: 'If an account exists, a reset email has been sent' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 
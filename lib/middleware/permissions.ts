import { NextApiRequest, NextApiResponse } from 'next';
import { Permission, hasPermission } from '../auth/roles';
import { db } from '../db/users';

export function withPermission(permission: Permission) {
  return async (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    const userId = req.headers['user-id'] as string; // Set by auth middleware
    const user = db.findUserById(userId);

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!hasPermission(user.role, permission)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return next();
  };
} 
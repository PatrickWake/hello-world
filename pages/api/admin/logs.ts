import { NextApiRequest, NextApiResponse } from 'next';
import { withSecurity } from '../../../lib/security';
import { Permission } from '../../../lib/auth/roles';
import { activityLogger } from '../../../lib/logging/activityLogger';

export const config = {
  runtime: 'edge',
  regions: ['iad1'], // Specify your preferred region
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId, type, startDate, endDate } = req.query;

    const logs = await activityLogger.getLogs({
      userId: userId as string,
      type: type as any,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined
    });

    res.status(200).json({ logs });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export default withSecurity(handler, {
  permission: Permission.MANAGE_USERS,
  rateLimit: 'api'
}); 
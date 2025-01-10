import { NextApiRequest, NextApiResponse } from 'next';
import { withRateLimit } from './rateLimit';
import { withSecurityHeaders } from './headers';
import { withInputSanitization } from './sanitize';
import { withPermission } from '../middleware/permissions';
import { Permission } from '../auth/roles';

export function withSecurity(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  options?: {
    rateLimit?: 'default' | 'auth' | 'api';
    permission?: Permission;
  }
) {
  let wrapped = handler;

  // Apply input sanitization
  wrapped = withInputSanitization(wrapped);

  // Apply security headers
  wrapped = withSecurityHeaders(wrapped);

  // Apply rate limiting if specified
  if (options?.rateLimit) {
    wrapped = withRateLimit(options.rateLimit)(wrapped);
  }

  // Apply permission check if specified
  if (options?.permission) {
    wrapped = withPermission(options.permission)(wrapped);
  }

  return wrapped;
}

// Usage example:
// export default withSecurity(handler, {
//   rateLimit: 'auth',
//   permission: Permission.MANAGE_USERS
// }); 
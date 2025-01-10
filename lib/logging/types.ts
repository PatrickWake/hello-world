export enum ActivityType {
  AUTH_LOGIN = 'AUTH_LOGIN',
  AUTH_LOGOUT = 'AUTH_LOGOUT',
  AUTH_FAILED_ATTEMPT = 'AUTH_FAILED_ATTEMPT',
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  ROLE_CHANGED = 'ROLE_CHANGED',
  PASSWORD_RESET_REQUESTED = 'PASSWORD_RESET_REQUESTED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  ADMIN_ACTION = 'ADMIN_ACTION'
}

export interface ActivityLog {
  id: string;
  timestamp: Date;
  type: ActivityType;
  userId: string;
  ipAddress: string;
  userAgent: string;
  details: Record<string, any>;
  metadata?: Record<string, any>;
} 
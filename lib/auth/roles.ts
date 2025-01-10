export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR'
}

export enum Permission {
  READ_POSTS = 'READ_POSTS',
  CREATE_POSTS = 'CREATE_POSTS',
  EDIT_POSTS = 'EDIT_POSTS',
  DELETE_POSTS = 'DELETE_POSTS',
  MANAGE_USERS = 'MANAGE_USERS',
  MANAGE_ROLES = 'MANAGE_ROLES'
}

const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.USER]: [
    Permission.READ_POSTS,
    Permission.CREATE_POSTS
  ],
  [UserRole.MODERATOR]: [
    Permission.READ_POSTS,
    Permission.CREATE_POSTS,
    Permission.EDIT_POSTS,
    Permission.DELETE_POSTS
  ],
  [UserRole.ADMIN]: [
    Permission.READ_POSTS,
    Permission.CREATE_POSTS,
    Permission.EDIT_POSTS,
    Permission.DELETE_POSTS,
    Permission.MANAGE_USERS,
    Permission.MANAGE_ROLES
  ]
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false;
} 
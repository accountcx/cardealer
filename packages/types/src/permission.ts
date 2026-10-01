// 🧠 Mental Model: Định nghĩa ma trận phân quyền RBAC cố định trong @cardealer/types
// Đảm bảo Type-Safe tuyệt đối và O(1) checking, chia sẻ đồng nhất giữa API và Admin Dashboard.

export type Role = 'admin' | 'manager' | 'editor' | 'sales';

export type PermissionAction =
  | 'users:read'
  | 'users:create'
  | 'users:update'
  | 'users:delete'
  | 'users:role'
  | 'users:force_logout'
  | 'cars:read'
  | 'cars:write'
  | 'posts:read'
  | 'posts:write'
  | 'leads:read'
  | 'leads:write'
  | 'system:read'
  | 'system:write'
  | 'media:read'
  | 'media:write'
  | 'media:delete'
  | 'pages:read'
  | 'pages:write'
  | 'pages:delete';

export const ROLE_PERMISSIONS: Record<Role, readonly PermissionAction[]> = {
  admin: [
    'users:read',
    'users:create',
    'users:update',
    'users:delete',
    'users:role',
    'users:force_logout',
    'cars:read',
    'cars:write',
    'posts:read',
    'posts:write',
    'leads:read',
    'leads:write',
    'system:read',
    'system:write',
    'media:read',
    'media:write',
    'media:delete',
    'pages:read',
    'pages:write',
    'pages:delete',
  ],
  manager: [
    'users:read',
    'users:update',
    'cars:read',
    'cars:write',
    'posts:read',
    'posts:write',
    'leads:read',
    'leads:write',
    'system:read',
    'media:read',
    'media:write',
    'media:delete',
    'pages:read',
    'pages:write',
    'pages:delete',
  ],
  editor: [
    'cars:read',
    'cars:write',
    'posts:read',
    'posts:write',
    'leads:read',
    'media:read',
    'media:write',
    'pages:read',
    'pages:write',
  ],
  sales: [
    'cars:read',
    'posts:read',
    'leads:read',
    'leads:write',
    'media:read',
  ],
} as const;

export function hasPermission(role: Role, action: PermissionAction): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(action);
}

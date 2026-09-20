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
  | 'leads:read'
  | 'leads:write'
  | 'system:read'
  | 'system:write';

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
    'leads:read',
    'leads:write',
    'system:read',
    'system:write',
  ],
  manager: [
    'users:read',
    'users:update',
    'cars:read',
    'cars:write',
    'leads:read',
    'leads:write',
    'system:read',
  ],
  editor: [
    'cars:read',
    'cars:write',
    'leads:read',
  ],
  sales: [
    'cars:read',
    'leads:read',
    'leads:write',
  ],
} as const;

export function hasPermission(role: Role, action: PermissionAction): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(action);
}

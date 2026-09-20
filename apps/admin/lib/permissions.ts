// 🧠 Mental Model: Pure Permission Helper cho tầng Giao diện Admin.
// Kiểm tra quyền O(1) theo ma trận RBAC đã chốt, dùng để ẩn/hiện các nút thao tác và menu điều hướng.
import { hasPermission, type Role, type PermissionAction, ROLE_PERMISSIONS } from '@cardealer/types';

export { hasPermission, ROLE_PERMISSIONS };
export type { Role, PermissionAction };

export function canUser(user: { role?: string } | null | undefined, action: PermissionAction): boolean {
  if (!user || !user.role) return false;
  return hasPermission(user.role as Role, action);
}

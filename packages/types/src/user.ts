// 🧠 Mental Model: Quản trị Zod DTOs cho Quản trị Người Dùng & Hồ Sơ Cá Nhân.
// Đảm bảo không rò rỉ passwordHash (R3 Mitigation) và kiểm soát độ phức tạp mật khẩu (R5 Mitigation).
import { z } from 'zod';
import { UserRoleSchema, UserStatusSchema } from './auth';

// Password complexity regex: min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

export const CreateUserSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(150),
  password: z
    .string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(passwordRegex, 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt'),
  phone: z.string().max(20).optional().nullable(),
  avatarUrl: z.string().max(500).optional().nullable(),
  role: UserRoleSchema.default('sales'),
});
export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = z.object({
  fullName: z.string().min(2).max(150).optional(),
  phone: z.string().max(20).optional().nullable(),
  avatarUrl: z.string().max(500).optional().nullable(),
  role: UserRoleSchema.optional(),
  status: UserStatusSchema.optional(),
});
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

export const UpdateUserStatusSchema = z.object({
  status: UserStatusSchema,
});
export type UpdateUserStatusInput = z.infer<typeof UpdateUserStatusSchema>;

export const UpdateUserRoleSchema = z.object({
  role: UserRoleSchema,
});
export type UpdateUserRoleInput = z.infer<typeof UpdateUserRoleSchema>;

export const UpdateProfileSchema = z.object({
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự').max(150),
  phone: z.string().max(20).optional().nullable(),
  avatarUrl: z.string().max(500).optional().nullable(),
});
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
    newPassword: z
      .string()
      .min(8, 'Mật khẩu mới phải có ít nhất 8 ký tự')
      .regex(passwordRegex, 'Mật khẩu mới phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt'),
    confirmPassword: z.string().min(1, 'Vui lòng xác nhận mật khẩu mới'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không trùng khớp',
    path: ['confirmPassword'],
  });
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

// Safe User Response DTO (Loại bỏ 100% passwordHash - R3)
export const UserResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  fullName: z.string(),
  phone: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
  role: UserRoleSchema,
  status: UserStatusSchema,
  tokenVersion: z.number(),
  lastLoginAt: z.union([z.string(), z.date()]).nullable().optional(),
  lastLoginIp: z.string().nullable().optional(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
});
export type UserResponse = z.infer<typeof UserResponseSchema>;

export const AuditLogResponseSchema = z.object({
  id: z.string(),
  userId: z.string().nullable().optional(),
  action: z.string(),
  resource: z.string(),
  resourceId: z.string().nullable().optional(),
  ipAddress: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
  details: z.any().nullable().optional(),
  createdAt: z.union([z.string(), z.date()]),
  userName: z.string().optional(),
  userEmail: z.string().optional(),
});
export type AuditLogResponse = z.infer<typeof AuditLogResponseSchema>;

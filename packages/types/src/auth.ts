import { z } from 'zod';

export const UserRoleSchema = z.enum(['admin', 'manager', 'editor', 'sales']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserStatusSchema = z.enum(['active', 'suspended', 'pending']);
export type UserStatus = z.infer<typeof UserStatusSchema>;

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  fullName: z.string(),
  phone: z.string().optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
  role: UserRoleSchema.default('admin'),
  status: UserStatusSchema.default('active'),
  tokenVersion: z.number().default(1),
  lastLoginAt: z.date().optional().nullable(),
  lastLoginIp: z.string().optional().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});
export type User = z.infer<typeof UserSchema>;

export const LoginInputSchema = z.object({
  email: z.string().email('Email không đúng định dạng'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});
export type LoginInput = z.infer<typeof LoginInputSchema>;

export const AuthTokenPayloadSchema = z.object({
  userId: z.string(),
  email: z.string(),
  fullName: z.string(),
  role: UserRoleSchema,
  tokenVersion: z.number(),
});
export type AuthTokenPayload = z.infer<typeof AuthTokenPayloadSchema>;

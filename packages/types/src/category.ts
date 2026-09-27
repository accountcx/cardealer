import { z } from 'zod';

// 🧠 Mental Model: Category Types & Zod Validation Schemas
// Định nghĩa DTOs, Schemas và Contracts dùng chung giữa Backend (apps/api), Admin (apps/admin) và Storefront (apps/web).
// Bắt buộc Regex cho Slug: chỉ cho phép chữ thường không dấu, số và gạch ngang đơn (CWE-79/XSS Protection).

export const categorySchema = z.object({
  id: z.string().uuid(),
  tenChuyenMuc: z.string().min(1, 'Tên chuyên mục không được để trống').max(150),
  slug: z
    .string()
    .min(1, 'Slug không được để trống')
    .max(150)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug chỉ gồm chữ thường không dấu, số và dấu gạch ngang'),
  moTa: z.string().nullable().optional(),
  sortOrder: z.number().int().default(0),
  postCount: z.number().int().default(0),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createCategorySchema = z.object({
  tenChuyenMuc: z.string().trim().min(1, 'Tên chuyên mục không được để trống').max(150),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug không được để trống')
    .max(150)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug chỉ gồm chữ thường không dấu, số và dấu gạch ngang'),
  moTa: z.string().trim().nullable().optional(),
  sortOrder: z.number().int().default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CategoryDTO = z.infer<typeof categorySchema>;
export type CreateCategoryDTO = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDTO = z.infer<typeof updateCategorySchema>;

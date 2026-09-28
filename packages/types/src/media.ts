import { z } from 'zod';

// 🧠 Mental Model: Data Contracts và Zod Schemas cho Thư viện Media & Tích hợp Cloudinary
// Thống nhất kiểu dữ liệu giữa Database, Backend REST API và Frontend Admin UI.

export const MediaItemSchema = z.object({
  id: z.string().uuid(),
  filename: z.string().min(1).max(255),
  url: z.string().url(),
  publicId: z.string().min(1).max(255),
  format: z.string().min(1).max(20),
  mimeType: z.string().min(1).max(100),
  fileSize: z.number().int().nonnegative(),
  altText: z.string().max(255).nullable().optional(),
  width: z.number().int().positive().nullable().optional(),
  height: z.number().int().positive().nullable().optional(),
  folder: z.string().max(100).default('cardealer'),
  uploaderId: z.string().uuid().nullable().optional(),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()).optional(),
});

export type MediaItem = z.infer<typeof MediaItemSchema>;

// Schema kiểm thực cập nhật thông tin Alt Text / Title ảnh
export const UpdateMediaSchema = z.object({
  altText: z.string().max(255, 'Alt text tối đa 255 ký tự').optional(),
  filename: z.string().max(255).optional(),
});

export type UpdateMediaInput = z.infer<typeof UpdateMediaSchema>;

// Schema kiểm thực phân trang và tìm kiếm danh sách media
export const MediaQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
  search: z.string().optional(),
  format: z.string().optional(),
  sortBy: z.enum(['newest', 'oldest', 'size_asc', 'size_desc', 'name_asc']).default('newest'),
});

export type MediaQueryInput = z.infer<typeof MediaQuerySchema>;

// Schema xóa hàng loạt ảnh
export const BatchDeleteMediaSchema = z.object({
  ids: z.array(z.string().uuid()).min(1, 'Cần tối thiểu 1 ID ảnh để xóa').max(50, 'Tối đa xóa 50 ảnh một lần'),
});

export type BatchDeleteMediaInput = z.infer<typeof BatchDeleteMediaSchema>;

// DTO phản hồi danh sách phân trang
export interface MediaPaginationResponse {
  items: MediaItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// Phân loại trạng thái upload trên Client Queue
export type UploadStatus = 'pending' | 'uploading' | 'success' | 'error';

export interface UploadTask {
  id: string;
  file: File;
  progress: number;
  status: UploadStatus;
  errorMessage?: string;
  result?: MediaItem;
}

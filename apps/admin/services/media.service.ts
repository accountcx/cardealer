import { apiClient } from '../lib/api-client';
import type {
  MediaItem,
  MediaQueryInput,
  MediaPaginationResponse,
  UpdateMediaInput,
} from '@cardealer/types';

// 🧠 Mental Model: Typed Media Service cho Admin Image Library (apps/admin).
// Tương tác trực tiếp với API namespace /api/admin/media/* thông qua apiClient thuần fetch.
// 1. Upload ảnh đơn qua apiClient.post với FormData trực tiếp.
// 2. Fetch danh sách ảnh phân trang, lọc và tìm kiếm theo DTOs chuẩn từ @cardealer/types.
// 3. Update Alt Text và xóa ảnh (đơn lẻ / batch).

/**
 * Lấy danh sách ảnh trong kho có phân trang, tìm kiếm, lọc và sắp xếp
 */
export async function getMediaList(params?: Partial<MediaQueryInput>): Promise<MediaPaginationResponse> {
  return apiClient.get<MediaPaginationResponse>('/api/admin/media', params);
}

/**
 * Cập nhật metadata của ảnh (Alt Text SEO, Filename)
 */
export async function updateMedia(id: string, data: UpdateMediaInput): Promise<MediaItem> {
  return apiClient.put<MediaItem>(`/api/admin/media/${id}`, data);
}

/**
 * Xóa một ảnh đơn lẻ khỏi hệ thống và Cloudinary
 */
export async function deleteMedia(id: string): Promise<{ id: string; message: string }> {
  return apiClient.delete<{ id: string; message: string }>(`/api/admin/media/${id}`);
}

/**
 * Xóa hàng loạt danh sách ảnh theo mảng IDs
 */
export async function batchDeleteMedia(
  ids: string[]
): Promise<{ deletedCount: number; failedCount: number; failedIds?: string[] }> {
  return apiClient.post<{ deletedCount: number; failedCount: number; failedIds?: string[] }>(
    '/api/admin/media/batch-delete',
    { ids }
  );
}

/**
 * Tải lên một tệp ảnh đơn lẻ qua fetch thuần túy (FormData)
 */
export async function uploadSingleMedia(
  file: File,
  altText?: string
): Promise<MediaItem> {
  const formData = new FormData();
  formData.append('file', file);
  if (altText) {
    formData.append('altText', altText);
  }

  return apiClient.post<MediaItem>('/api/admin/media/upload', formData);
}

export const mediaService = {
  getMediaList,
  updateMedia,
  deleteMedia,
  batchDeleteMedia,
  uploadSingleMedia,
};

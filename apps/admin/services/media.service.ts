import { apiClient, AppError } from '../lib/api-client';
import { clientEnv } from '@cardealer/env';
import type {
  MediaItem,
  MediaQueryInput,
  MediaPaginationResponse,
  UpdateMediaInput,
} from '@cardealer/types';

// 🧠 Mental Model: Typed Media Service cho Admin Image Library (apps/admin).
// Tương tác trực tiếp với API namespace /api/admin/media/*.
// 1. Upload ảnh đơn qua XMLHttpRequest với onprogress để đo lường tiến trình % mượt mà (0% -> 100%).
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
 * Tải lên một tệp ảnh đơn lẻ có lắng nghe tiến trình % (XHR Stream)
 */
export function uploadSingleMedia(
  file: File,
  altText?: string,
  onProgress?: (percent: number) => void
): Promise<MediaItem> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const baseUrl = clientEnv.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
    const uploadUrl = baseUrl.endsWith('/api')
      ? `${baseUrl}/admin/media/upload`
      : `${baseUrl}/api/admin/media/upload`;

    xhr.open('POST', uploadUrl, true);
    xhr.withCredentials = true; // Gửi cookie admin_token HttpOnly

    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      try {
        const response = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && response.success) {
          resolve(response.data as MediaItem);
        } else {
          const errorMsg = response.error?.message || `Lỗi tải lên (${xhr.status})`;
          reject(new AppError(errorMsg, response.error?.code || 'UPLOAD_FAILED', xhr.status));
        }
      } catch {
        reject(new AppError(`Lỗi máy chủ (${xhr.status})`, 'SERVER_ERROR', xhr.status));
      }
    };

    xhr.onerror = () => {
      reject(
        new AppError(
          'Không thể kết nối đến máy chủ khi tải ảnh lên. Vui lòng kiểm tra mạng.',
          'NETWORK_ERROR',
          0
        )
      );
    };

    const formData = new FormData();
    formData.append('file', file);
    if (altText) {
      formData.append('altText', altText);
    }

    xhr.send(formData);
  });
}

export const mediaService = {
  getMediaList,
  updateMedia,
  deleteMedia,
  batchDeleteMedia,
  uploadSingleMedia,
};

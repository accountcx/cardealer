import { apiClient } from '../lib/api-client';
import type { CategoryDTO, CreateCategoryDTO, UpdateCategoryDTO } from '@cardealer/types';

// 🧠 Mental Model: Typed Category Service cho Quản Trị Chuyên Mục (apps/admin).
// Tương tác trực tiếp với API namespace /api/admin/categories/*.
// Phục vụ danh sách chuyên mục kèm postCount, tạo mới, cập nhật và xóa an toàn.

export const categoryService = {
  /**
   * Lấy danh sách toàn bộ chuyên mục kèm số lượng bài viết (postCount)
   */
  getCategories: async (): Promise<CategoryDTO[]> => {
    return apiClient.get<CategoryDTO[]>('/api/admin/categories');
  },

  /**
   * Tạo chuyên mục mới
   */
  createCategory: async (data: CreateCategoryDTO): Promise<CategoryDTO> => {
    return apiClient.post<CategoryDTO>('/api/admin/categories', data);
  },

  /**
   * Cập nhật thông tin chuyên mục theo ID
   */
  updateCategory: async (id: string, data: UpdateCategoryDTO): Promise<CategoryDTO> => {
    return apiClient.put<CategoryDTO>(`/api/admin/categories/${id}`, data);
  },

  /**
   * Xóa chuyên mục theo ID (chỉ thành công nếu postCount == 0)
   */
  deleteCategory: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete<{ success: boolean; message: string }>(`/api/admin/categories/${id}`);
  },
};

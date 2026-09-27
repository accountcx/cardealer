import { apiClient } from '../lib/api-client';

// 🧠 Mental Model: Typed Service Layer cho Quản trị Bài viết Tin tức (apps/admin).
// Tương tác trực tiếp với API namespace /api/admin/posts/* và /api/admin/categories/*.
// Phục vụ danh sách bài viết, bộ lọc chuyên mục, trạng thái và xóa bài viết.

export interface PostItem {
  id: string;
  tieuDe: string;
  slug: string;
  categoryId: string;
  authorId?: string | null;
  anhDaiDienUrl: string;
  anhDaiDienAlt: string;
  tomTat?: string | null;
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  scheduledAt?: string | null;
  expiredPromoDate?: string | null;
  isFeatured: boolean;
  featuredOrder: number;
  readingTime: number;
  wordCount: number;
  viewCount: number;
  previewToken?: string | null;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    tenChuyenMuc: string;
    slug: string;
  } | null;
  author?: {
    id: string;
    fullName: string;
    role: string;
  } | null;
}

export interface PostListResponse {
  data: PostItem[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface CategoryItem {
  id: string;
  tenChuyenMuc: string;
  slug: string;
  moTa?: string | null;
  sortOrder: number;
  createdAt: string;
}

export const postService = {
  /**
   * Lấy danh sách bài viết quản trị có phân trang & bộ lọc
   */
  getPosts: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    categoryId?: string;
    search?: string;
  }): Promise<PostListResponse> => {
    const res = await apiClient.get<any>('/api/admin/posts', params);
    if (Array.isArray(res)) {
      return {
        data: res,
        pagination: {
          page: params?.page || 1,
          limit: params?.limit || 15,
          totalItems: res.length,
          totalPages: 1,
        },
      };
    }
    if (res && Array.isArray(res.data)) {
      return res;
    }
    return {
      data: [],
      pagination: { page: 1, limit: 15, totalItems: 0, totalPages: 1 },
    };
  },

  /**
   * Lấy danh sách chuyên mục tin tức
   */
  getCategories: async (): Promise<{ success: boolean; data: CategoryItem[] }> => {
    const res = await apiClient.get<any>('/api/admin/categories');
    const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
    return { success: true, data: list };
  },

  /**
   * Lấy chi tiết bài viết theo ID
   */
  getPostById: async (id: string): Promise<{ success: boolean; data: PostItem & { noiDung: unknown } }> => {
    const res = await apiClient.get<any>(`/api/admin/posts/${id}`);
    const postData = (res && res.data) ? res.data : res;
    return { success: true, data: postData };
  },

  /**
   * Tạo bài viết mới
   */
  createPost: async (payload: unknown): Promise<{ success: boolean; data: PostItem; message?: string }> => {
    const res = await apiClient.post<any>('/api/admin/posts', payload);
    const postData = (res && res.data) ? res.data : res;
    return { success: true, data: postData, message: 'Tạo bài viết mới thành công' };
  },

  /**
   * Cập nhật bài viết theo ID
   */
  updatePost: async (id: string, payload: unknown): Promise<{ success: boolean; data: PostItem; message?: string }> => {
    const res = await apiClient.put<any>(`/api/admin/posts/${id}`, payload);
    const postData = (res && res.data) ? res.data : res;
    return { success: true, data: postData, message: 'Cập nhật bài viết thành công' };
  },

  /**
   * Xóa bài viết theo ID
   */
  deletePost: async (id: string): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete<any>(`/api/admin/posts/${id}`);
    return { success: true, message: res?.message || 'Xóa bài viết thành công' };
  },
};

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
    return apiClient.get<PostListResponse>('/api/admin/posts', params);
  },

  /**
   * Lấy danh sách chuyên mục tin tức
   */
  getCategories: async (): Promise<{ success: boolean; data: CategoryItem[] }> => {
    return apiClient.get<{ success: boolean; data: CategoryItem[] }>('/api/admin/categories');
  },

  /**
   * Lấy chi tiết bài viết theo ID
   */
  getPostById: async (id: string): Promise<{ success: boolean; data: PostItem & { noiDung: unknown } }> => {
    return apiClient.get<{ success: boolean; data: PostItem & { noiDung: unknown } }>(`/api/admin/posts/${id}`);
  },

  /**
   * Tạo bài viết mới
   */
  createPost: async (payload: unknown): Promise<{ success: boolean; data: PostItem; message?: string }> => {
    return apiClient.post<{ success: boolean; data: PostItem; message?: string }>('/api/admin/posts', payload);
  },

  /**
   * Cập nhật bài viết theo ID
   */
  updatePost: async (id: string, payload: unknown): Promise<{ success: boolean; data: PostItem; message?: string }> => {
    return apiClient.put<{ success: boolean; data: PostItem; message?: string }>(`/api/admin/posts/${id}`, payload);
  },

  /**
   * Xóa bài viết theo ID
   */
  deletePost: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete<{ success: boolean; message: string }>(`/api/admin/posts/${id}`);
  },
};

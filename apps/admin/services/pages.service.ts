import { apiClient } from '../lib/api-client';
import type {
  StaticPage,
  CreateStaticPageDTO,
  UpdateStaticPageDTO,
  StaticPageTemplate,
} from '@cardealer/types';

export interface ListPagesParams {
  page?: number;
  limit?: number;
  status?: string;
  templateType?: StaticPageTemplate;
  search?: string;
}

export interface ListPagesResponse {
  items: StaticPage[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

// WHY: Typed Service Layer tương tác với API namespace /api/admin/pages/* (Separation of Concerns).
// Tách biệt HTTP Transport khỏi UI Components, tự động quản lý authentication credentials qua apiClient.
export const pagesService = {
  /**
   * Lấy danh sách trang tĩnh có phân trang & bộ lọc
   */
  async listPages(params: ListPagesParams = {}): Promise<ListPagesResponse> {
    const queryParams: Record<string, string | number | boolean | undefined> = {
      page: params.page,
      limit: params.limit,
      status: params.status,
      templateType: params.templateType,
      search: params.search,
    };

    return apiClient.get<ListPagesResponse>('/admin/pages', queryParams);
  },

  /**
   * Lấy chi tiết một trang tĩnh theo ID (UUID v4)
   */
  async getPageById(id: string): Promise<StaticPage> {
    return apiClient.get<StaticPage>(`/admin/pages/${id}`);
  },

  /**
   * Tạo mới một trang tĩnh
   */
  async createPage(data: CreateStaticPageDTO): Promise<StaticPage> {
    return apiClient.post<StaticPage>('/admin/pages', data);
  },

  /**
   * Cập nhật thông tin trang tĩnh
   */
  async updatePage(id: string, data: UpdateStaticPageDTO): Promise<StaticPage> {
    return apiClient.put<StaticPage>(`/admin/pages/${id}`, data);
  },

  /**
   * Xóa vĩnh viễn trang tĩnh theo ID
   */
  async deletePage(id: string): Promise<void> {
    await apiClient.delete(`/admin/pages/${id}`);
  },
};

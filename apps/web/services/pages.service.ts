import { apiClient } from '../lib/api-client';
import type { StaticPage } from '@cardealer/types';

// WHY: Typed Service Layer truy xuất trang tĩnh công khai cho Storefront (apps/web).
// Hỗ trợ Next.js ISR (Incremental Static Regeneration) cache 60s và on-demand revalidation qua Cache Tags.
export const pagesService = {
  /**
   * Lấy chi tiết trang tĩnh theo slug ngoài Storefront.
   * Backend đảm bảo cơ chế Fail-Closed (chỉ trả về khi isPublished = true).
   */
  async getPageBySlug(slug: string): Promise<StaticPage | null> {
    try {
      const response = await apiClient.get<StaticPage>(`/api/public/pages/${slug}`, undefined, {
        next: {
          tags: ['static-page', `static-page-${slug}`],
          revalidate: 60,
        },
      });
      return response || null;
    } catch (err: unknown) {
      console.error('[DEBUG pagesService] Lỗi khi truy vấn trang tĩnh theo slug:', slug, err);
      return null;
    }
  },
};

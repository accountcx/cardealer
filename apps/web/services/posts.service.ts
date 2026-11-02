import { apiClient } from "../lib/api-client";
import type { ArticlePreview } from "../components/home/LatestNewsSection";

// 🧠 Mental Model: Typed Service Layer nạp tin tức bài viết cho Storefront (Web).
// 1. Phục vụ phân khu 'Tin Tức Khuyến Mại & Sự Kiện' trên Trang Chủ và các thành phần liên quan.
// 2. Tự động chuẩn hóa định dạng ngày đăng (dd/MM/yyyy) theo chuẩn địa phương vi-VN.
// 3. Fallback an toàn (Graceful Degradation): Trả về mảng rỗng nếu API lỗi để caller kích hoạt fallback.
export const postsService = {
  /**
   * Nạp danh sách bài viết mới nhất đã xuất bản (status = 'published')
   */
  getLatestPromotions: async (limit = 3): Promise<ArticlePreview[]> => {
    try {
      const data = await apiClient.get<any>(
        "/api/posts",
        { limit },
        {
          next: {
            tags: ["posts", "latest-posts"],
            revalidate: 60,
          },
        },
      );

      const items: any[] = Array.isArray(data) ? data : data?.data || [];
      if (items.length > 0) {
        return items.map((p) => {
          const dateStr = p.publishedAt || p.createdAt;
          let formattedDate = "";
          if (dateStr) {
            try {
              const d = new Date(dateStr);
              formattedDate = !isNaN(d.getTime())
                ? d.toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : String(dateStr);
            } catch {
              formattedDate = String(dateStr);
            }
          }

          return {
            id: p.id,
            title: p.tieuDe,
            slug: p.slug,
            summary: p.tomTat || "",
            thumbnailUrl: p.anhDaiDienUrl || "/images/banners/hero-event.webp",
            publishedAt: formattedDate,
          };
        });
      }
    } catch (err: unknown) {
      console.warn(
        "[Posts Service] Không thể nạp bài viết mới nhất từ API, kích hoạt fallback:",
        err instanceof Error ? err.message : String(err),
      );
    }

    return [];
  },
};

export const getLatestPromotions = postsService.getLatestPromotions;

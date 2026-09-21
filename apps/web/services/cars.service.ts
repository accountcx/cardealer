import { apiClient } from '../lib/api-client';
import type { CarItem } from '../components/calculator/SmartCalculator';
import type { CarCatalogItem } from '@cardealer/types';

// 🧠 Mental Model: Typed Service Layer quản lý danh sách xe cho Storefront (Web).
// Thay thế toàn bộ lời gọi fetch() trực tiếp bằng apiClient trung tâm.
// Hỗ trợ Server-Side Rendering (ISR revalidate 60s) và Client-side calls.
export const carsService = {
  /**
   * Lấy danh sách xe phục vụ bộ tính lăn bánh & trả góp
   */
  getCarsList: async (): Promise<CarItem[]> => {
    try {
      const data = await apiClient.get<any[]>('/api/cars', undefined, {
        next: {
          tags: ['catalog-cars'],
          revalidate: 60,
        },
      });

      if (Array.isArray(data) && data.length > 0) {
        return data.map((c: any) => ({
          id: c.id,
          tenXe: c.tenXe,
          slug: c.slug,
          versions: (c.versions || []).map((v: any) => ({
            id: v.id,
            tenPhienBan: v.tenPhienBan,
            giaNiemYet: Number(v.giaNiemYet || 0),
          })),
        }));
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[Cars Service] Không thể nạp danh sách xe từ API: ${msg}`);
    }

    return [];
  },

  /**
   * Nạp danh sách các dòng xe bán chạy ghim nổi bật cho Khu 4 Trang Chủ
   */
  getFeaturedCars: async (): Promise<any[]> => {
    try {
      const data = await apiClient.get<any[]>('/api/cars', { isFeatured: true, limit: 6 }, {
        next: {
          tags: ['catalog-cars'],
          revalidate: 60,
        },
      });

      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[Featured Cars Service] Không thể nạp xe nổi bật từ API: ${msg}`);
    }

    return [];
  },

  /**
   * Nạp đầy đủ danh sách dòng xe phục vụ trang danh mục và bộ lọc đa chiều (/xe).
   */
  getCatalogCars: async (): Promise<CarCatalogItem[]> => {
    try {
      const data = await apiClient.get<CarCatalogItem[]>('/api/cars', undefined, {
        next: {
          tags: ['catalog-cars'],
          revalidate: 60,
        },
      });

      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[Catalog Service] Không thể nạp danh mục xe từ API: ${msg}`);
    }

    return [];
  },
};

// Aliases duy trì tương thích ngược cho các import hiện hữu
export const getCarsList = carsService.getCarsList;
export const getFeaturedCars = carsService.getFeaturedCars;
export const getCatalogCars = carsService.getCatalogCars;

import type { CarItem } from '../components/calculator/SmartCalculator';

const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  'http://localhost:4000';

// 🧠 Mental Model: Service lấy danh sách xe cho Storefront với ISR Cache Tag 'catalog-cars'.
export async function getCarsList(): Promise<CarItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/cars`, {
      next: {
        tags: ['catalog-cars'],
        revalidate: 60,
      },
      headers: {
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      console.warn(`[Cars Service] Backend API trả về HTTP ${res.status}`);
      return [];
    }

    const json = (await res.json()) as { success?: boolean; data?: any[] };
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      return json.data.map((c: any) => ({
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
    console.warn(`[Cars Service] Không thể kết nối Backend (${API_BASE_URL}): ${msg}`);
  }

  return [];
}

// 🧠 Mental Model: Nạp danh sách các dòng xe bán chạy ghim nổi bật cho Khu 4 Trang Chủ.
export async function getFeaturedCars(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/cars?isFeatured=true&limit=6`, {
      next: {
        tags: ['catalog-cars'],
        revalidate: 60,
      },
      headers: {
        Accept: 'application/json',
      },
    });

    if (res.ok) {
      const json = (await res.json()) as { success?: boolean; data?: any[] };
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        return json.data;
      }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[Featured Cars Service] Không thể nạp xe nổi bật từ API: ${msg}`);
  }

  return [];
}

import type { CarItem } from '../components/calculator/SmartCalculator';

const API_BASE_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  'http://localhost:4000';

// 🧠 Mental Model: Dữ liệu xe mẫu dự phòng khi Backend API chưa sẵn sàng hoặc đang khởi động.
export const FALLBACK_CARS: CarItem[] = [
  {
    id: 'tucson-default',
    tenXe: 'Hyundai Tucson 2025',
    slug: 'hyundai-tucson',
    versions: [
      { id: 'v-tucson-1', tenPhienBan: '2.0 Xăng Tiêu Chuẩn', giaNiemYet: 769_000_000 },
      { id: 'v-tucson-2', tenPhienBan: '2.0 Xăng Đặc Biệt', giaNiemYet: 859_000_000 },
      { id: 'v-tucson-3', tenPhienBan: '1.6 Turbo HTRAC', giaNiemYet: 979_000_000 },
      { id: 'v-tucson-4', tenPhienBan: '2.0 Dầu Đặc Biệt', giaNiemYet: 989_000_000 },
    ],
  },
  {
    id: 'accent-default',
    tenXe: 'Hyundai Accent Thế Hệ Mới',
    slug: 'hyundai-accent',
    versions: [
      { id: 'v-accent-1', tenPhienBan: '1.5 MT Tiêu Chuẩn', giaNiemYet: 439_000_000 },
      { id: 'v-accent-2', tenPhienBan: '1.5 AT Tiêu Chuẩn', giaNiemYet: 489_000_000 },
      { id: 'v-accent-3', tenPhienBan: '1.5 AT Đặc Biệt', giaNiemYet: 529_000_000 },
      { id: 'v-accent-4', tenPhienBan: '1.5 AT Cao Cấp', giaNiemYet: 569_000_000 },
    ],
  },
  {
    id: 'creta-default',
    tenXe: 'Hyundai Creta',
    slug: 'hyundai-creta',
    versions: [
      { id: 'v-creta-1', tenPhienBan: '1.5 Tiêu Chuẩn', giaNiemYet: 599_000_000 },
      { id: 'v-creta-2', tenPhienBan: '1.5 Đặc Biệt', giaNiemYet: 650_000_000 },
      { id: 'v-creta-3', tenPhienBan: '1.5 Cao Cấp', giaNiemYet: 699_000_000 },
    ],
  },
  {
    id: 'santafe-default',
    tenXe: 'Hyundai Santa Fe Hoàn Toàn Mới',
    slug: 'hyundai-santafe',
    versions: [
      { id: 'v-santafe-1', tenPhienBan: 'Exclusive 2.5 Xăng', giaNiemYet: 1_069_000_000 },
      { id: 'v-santafe-2', tenPhienBan: 'Prestige 2.5 Xăng', giaNiemYet: 1_265_000_000 },
      { id: 'v-santafe-3', tenPhienBan: 'Calligraphy 2.5 Xăng', giaNiemYet: 1_365_000_000 },
      { id: 'v-santafe-4', tenPhienBan: 'Calligraphy 2.5 Turbo', giaNiemYet: 1_465_000_000 },
    ],
  },
  {
    id: 'custin-default',
    tenXe: 'Hyundai Custin',
    slug: 'hyundai-custin',
    versions: [
      { id: 'v-custin-1', tenPhienBan: '1.5T Tiêu Chuẩn', giaNiemYet: 820_000_000 },
      { id: 'v-custin-2', tenPhienBan: '1.5T Đặc Biệt', giaNiemYet: 915_000_000 },
      { id: 'v-custin-3', tenPhienBan: '2.0T Cao Cấp', giaNiemYet: 974_000_000 },
    ],
  },
];

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
      console.warn(`[Cars Service] Backend API trả về HTTP ${res.status}, sử dụng dữ liệu dự phòng`);
      return FALLBACK_CARS;
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

  return FALLBACK_CARS;
}

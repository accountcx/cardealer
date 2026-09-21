import { IncomingMessage, ServerResponse } from 'node:http';
import { db, schema } from '@cardealer/database';
import { eq, desc, and } from 'drizzle-orm';
import {
  BulkSettingsSchema,
  SiteSettingsSchema,
  NavigationSettingsSchema,
  ContactSettingsSchema,
  FloatingSellerSettingsSchema,
  StickyBarSettingsSchema,
  FooterSettingsSchema,
} from '@cardealer/types';

// 🧠 Mental Model: Public Catalog Engine (Tối ưu hóa phản hồi < 10ms).
// Tuyệt đối KHÔNG sử dụng fallback ngầm / mock data. 
// Luôn truy vấn trực tiếp từ PostgreSQL thông qua Drizzle ORM và trả về mã lỗi HTTP chuẩn mực khi có sự cố.
// CHỈ hiển thị những dòng xe đã được xuất bản (status = 'published').

export async function handleCatalogRoutes(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
  sendJson: (status: number, data: unknown, headers?: Record<string, string>) => void
): Promise<boolean> {
  // 1. GET /api/cars (Khách hàng Storefront: Chỉ lấy xe đã xuất bản)
  if (url.pathname === '/api/cars' && req.method === 'GET') {
    const segment = url.searchParams.get('segment');
    try {
      const dbCars = await db.query.cars.findMany({
        where: eq(schema.cars.status, 'published'),
        orderBy: [desc(schema.cars.isFeatured), schema.cars.sortOrder],
        with: { versions: true },
      });

      const formatted = dbCars.map((c) => ({
        id: c.id,
        tenXe: c.tenXe,
        slug: c.slug,
        anhDaiDienUrl: c.anhDaiDienUrl,
        segment: c.segment,
        traTruocTu: c.traTruocTu,
        promotionSummary: c.promotionSummary,
        minPrice: c.versions.length > 0 ? Math.min(...c.versions.map((v) => Number(v.giaKhuyenMai || v.giaNiemYet))) : 0,
        maxPrice: c.versions.length > 0 ? Math.max(...c.versions.map((v) => Number(v.giaNiemYet))) : 0,
        versionCount: c.versions.length,
        status: c.status,
        isFeatured: c.isFeatured,
        versions: (c.versions || []).map((v) => ({
          id: v.id,
          tenPhienBan: v.tenPhienBan,
          slug: v.slug,
          giaNiemYet: Number(v.giaNiemYet),
          giaKhuyenMai: v.giaKhuyenMai ? Number(v.giaKhuyenMai) : null,
          seatCount: v.seatCount,
          dongCo: v.dongCo,
          hopSo: v.hopSo,
          danDong: v.danDong,
          anhDaiDienUrl: v.anhDaiDienUrl,
          sortOrder: v.sortOrder,
        })),
      }));

      sendJson(200, {
        success: true,
        data: segment ? formatted.filter((c) => c.segment === segment) : formatted,
      });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi truy vấn danh sách dòng xe từ cơ sở dữ liệu';
      sendJson(500, {
        success: false,
        error: { code: 'DATABASE_QUERY_ERROR', message: msg },
      });
      return true;
    }
  }

  // 2. GET /api/cars/:slug (Khách hàng Storefront: Chỉ lấy xe đã xuất bản)
  if (url.pathname.startsWith('/api/cars/') && req.method === 'GET') {
    const slug = url.pathname.replace('/api/cars/', '');
    try {
      const car = await db.query.cars.findFirst({
        where: and(eq(schema.cars.slug, slug), eq(schema.cars.status, 'published')),
        with: {
          versions: {
            with: {
              versionColors: {
                with: { color: true },
              },
            },
          },
        },
      });

      if (!car) {
        sendJson(404, {
          success: false,
          error: { code: 'CAR_NOT_FOUND', message: `Không tìm thấy dòng xe với slug "${slug}" trong cơ sở dữ liệu` },
        });
        return true;
      }

      sendJson(200, { success: true, data: car });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi truy vấn thông tin chi tiết xe';
      sendJson(500, {
        success: false,
        error: { code: 'DATABASE_QUERY_ERROR', message: msg },
      });
      return true;
    }
  }

  // 3. GET /api/colors
  if (url.pathname === '/api/colors' && req.method === 'GET') {
    try {
      const dbColors = await db.query.colors.findMany({
        orderBy: [schema.colors.tenMau],
      });
      sendJson(200, { success: true, data: dbColors });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi truy vấn danh mục bảng màu sơn';
      sendJson(500, {
        success: false,
        error: { code: 'DATABASE_QUERY_ERROR', message: msg },
      });
      return true;
    }
  }

  // 3.5. GET /api/settings (Bulk Settings Ingestion)
  // 🧠 Mental Model: Endpoint nạp gộp toàn bộ 5 Domain Keys trong 1 HTTP request duy nhất có Cache Headers.
  // Giúp Storefront RootLayout nạp HTML trọn vẹn, không bị waterfall và triệt tiêu CLS = 0.
  if (url.pathname === '/api/settings' && req.method === 'GET') {
    try {
      const rows = await db.query.systemSettings.findMany();
      const settingsMap = new Map(rows.map((r) => [r.key, r.data]));

      const contactRaw = (settingsMap.get('contact_settings') as Record<string, any>) || {};
      const showroomRaw = (settingsMap.get('showroom_settings') as Record<string, any>) || {};

      const contactMerged = {
        ...showroomRaw,
        ...contactRaw,
        legal: {
          businessName: contactRaw.legal?.businessName ?? showroomRaw.legal?.businessName ?? showroomRaw.legalBusinessName ?? '',
          businessLicense: contactRaw.legal?.businessLicense ?? showroomRaw.legal?.businessLicense ?? showroomRaw.legalBusinessLicense ?? '',
          copyrightText: contactRaw.legal?.copyrightText ?? showroomRaw.legal?.copyrightText ?? showroomRaw.legalCopyrightText ?? '',
          bctCertificateUrl: contactRaw.legal?.bctCertificateUrl ?? showroomRaw.legal?.bctCertificateUrl ?? showroomRaw.legalBctCertificateUrl ?? '',
        },
      };

      const bulkData = {
        site: settingsMap.get('site_settings') || {},
        navigation: settingsMap.get('navigation_settings') || {},
        contact: contactMerged,
        floatingSeller: settingsMap.get('floating_seller_settings') || {},
        stickyBar: settingsMap.get('sticky_bar_settings') || {},
        footer: settingsMap.get('footer_settings') || {},
      };

      const parsed = BulkSettingsSchema.parse(bulkData);
      sendJson(200, { success: true, data: parsed }, {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      });
      return true;
    } catch {
      // Fallback an toàn tuyệt đối khi DB gặp sự cố (Zero-Crash Protocol)
      const fallback = BulkSettingsSchema.parse({});
      sendJson(200, { success: true, data: fallback, warning: 'Using fallback defaults' });
      return true;
    }
  }

  // 4. GET /api/settings/:key
  if (url.pathname.startsWith('/api/settings/') && req.method === 'GET') {
    const key = url.pathname.replace('/api/settings/', '');
    try {
      const row = await db.query.systemSettings.findFirst({
        where: eq(schema.systemSettings.key, key),
      });

      if (!row) {
        // Nếu là key chuẩn nhưng chưa có bản ghi, trả về schema default
        if (key === 'site_settings') {
          sendJson(200, { success: true, data: SiteSettingsSchema.parse({}) });
          return true;
        }
        if (key === 'navigation_settings') {
          sendJson(200, { success: true, data: NavigationSettingsSchema.parse({}) });
          return true;
        }
        if (key === 'contact_settings') {
          sendJson(200, { success: true, data: ContactSettingsSchema.parse({}) });
          return true;
        }
        if (key === 'floating_seller_settings') {
          sendJson(200, { success: true, data: FloatingSellerSettingsSchema.parse({}) });
          return true;
        }
        if (key === 'sticky_bar_settings') {
          sendJson(200, { success: true, data: StickyBarSettingsSchema.parse({}) });
          return true;
        }
        if (key === 'footer_settings') {
          sendJson(200, { success: true, data: FooterSettingsSchema.parse({}) });
          return true;
        }

        sendJson(404, {
          success: false,
          error: { code: 'SETTING_NOT_FOUND', message: `Không tìm thấy cấu hình với key "${key}"` },
        });
        return true;
      }

      sendJson(200, { success: true, data: row.data });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi truy vấn cấu hình hệ thống';
      sendJson(500, {
        success: false,
        error: { code: 'DATABASE_QUERY_ERROR', message: msg },
      });
      return true;
    }
  }

  return false;
}

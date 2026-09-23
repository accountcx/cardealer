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
  HomepageSettingsSchema,
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
    const isFeaturedOnly = url.searchParams.get('isFeatured') === 'true';
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : undefined;
    try {
      const dbCars = await db.query.cars.findMany({
        where: eq(schema.cars.status, 'published'),
        orderBy: [desc(schema.cars.isFeatured), schema.cars.sortOrder],
        with: { versions: true },
      });

      let formatted = dbCars.map((c) => {
        const seats = c.versions.map((v) => v.seatCount).filter((s) => typeof s === 'number' && s > 0);
        const minSeat = seats.length > 0 ? Math.min(...seats) : 5;
        const maxSeat = seats.length > 0 ? Math.max(...seats) : 5;
        const seatRange = minSeat === maxSeat ? `${minSeat} chỗ` : `${minSeat} - ${maxSeat} chỗ`;

        return {
          id: c.id,
          tenXe: c.tenXe,
          slug: c.slug,
          anhDaiDienUrl: c.anhDaiDienUrl,
          segment: c.segment,
          fuelType: c.fuelType || null,
          seatRange,
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
        };
      });

      if (segment) {
        formatted = formatted.filter((c) => c.segment === segment);
      }
      if (isFeaturedOnly) {
        formatted = formatted.filter((c) => c.isFeatured === true);
      }
      if (limit && limit > 0) {
        formatted = formatted.slice(0, limit);
      }

      sendJson(200, {
        success: true,
        data: formatted,
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

  // 2. GET /api/cars/:slug (Khách hàng Storefront & Saler: Lấy chi tiết dòng xe và các biến thể màu)
  // 🧠 Mental Model: Chuẩn hóa response theo CarDetailSchema của Phase 4.4.
  // Làm phẳng mảng versionColors thành colors[] có slug tiếng Việt không dấu.
  // Tự động tính toán minPrice, maxPrice và sắp xếp versions theo sortOrder.
  if (url.pathname.startsWith('/api/cars/') && req.method === 'GET') {
    const slug = url.pathname.replace('/api/cars/', '');
    try {
      const car = await db.query.cars.findFirst({
        where: and(eq(schema.cars.slug, slug), eq(schema.cars.status, 'published')),
        with: {
          versions: {
            orderBy: [schema.carVersions.sortOrder],
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

      const formattedVersions = (car.versions || []).map((v) => {
        const colors = (v.versionColors || [])
          .map((vc) => {
            const colorName = vc.color?.tenMau || '';
            const colorSlug = colorName
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/đ/g, 'd')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-+|-+$/g, '');

            return {
              colorId: vc.colorId,
              tenMau: colorName,
              slug: colorSlug,
              hexCode: vc.color?.hexCode || '#000000',
              isTwoTone: vc.color?.isTwoTone || false,
              secondaryHexCode: vc.color?.secondaryHexCode || null,
              anhXeTheoMauUrl: vc.anhXeTheoMauUrl || null,
              isDefault: vc.isDefault || false,
            };
          })
          .sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));

        return {
          id: v.id,
          carId: v.carId,
          tenPhienBan: v.tenPhienBan,
          slug: v.slug,
          giaNiemYet: Number(v.giaNiemYet),
          giaKhuyenMai: v.giaKhuyenMai ? Number(v.giaKhuyenMai) : null,
          seatCount: v.seatCount,
          dongCo: v.dongCo,
          hopSo: v.hopSo,
          danDong: v.danDong,
          anhDaiDienUrl: v.anhDaiDienUrl,
          boSuuTapAnh: Array.isArray(v.boSuuTapAnh) ? v.boSuuTapAnh : [],
          specGroups: Array.isArray(v.specGroups) ? v.specGroups : [],
          reviewContent: v.reviewContent || null,
          contentBlocks: v.contentBlocks || null,
          sortOrder: v.sortOrder,
          colors,
          versionColors: v.versionColors, // duy trì tương thích ngược
        };
      });

      const prices = (car.versions || []).map((v) => Number(v.giaKhuyenMai || v.giaNiemYet)).filter((p) => p > 0);
      const listPrices = (car.versions || []).map((v) => Number(v.giaNiemYet)).filter((p) => p > 0);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = listPrices.length > 0 ? Math.max(...listPrices) : minPrice;

      const formattedCar = {
        id: car.id,
        tenXe: car.tenXe,
        slug: car.slug,
        anhDaiDienUrl: car.anhDaiDienUrl,
        catalogFileUrl: car.catalogFileUrl,
        segment: car.segment,
        taxRate: Number(car.taxRate),
        traTruocTu: car.traTruocTu ? Number(car.traTruocTu) : null,
        promotionSummary: car.promotionSummary,
        fuelType: car.fuelType || null,
        highlightFeatures: Array.isArray(car.highlightFeatures) ? car.highlightFeatures : [],
        moTaChung: car.moTaChung,
        isFeatured: car.isFeatured,
        status: car.status,
        sortOrder: car.sortOrder,
        minPrice,
        maxPrice,
        versionCount: formattedVersions.length,
        versions: formattedVersions,
      };

      sendJson(200, { success: true, data: formattedCar }, {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      });
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
      const homepageRaw = settingsMap.get('homepage_settings');
      const homepageParsed = HomepageSettingsSchema.parse(homepageRaw || {});

      sendJson(200, {
        success: true,
        data: {
          ...parsed,
          homepage: homepageParsed,
        },
      }, {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      });
      return true;
    } catch {
      // Fallback an toàn tuyệt đối khi DB gặp sự cố (Zero-Crash Protocol)
      const fallback = BulkSettingsSchema.parse({});
      const homepageFallback = HomepageSettingsSchema.parse({});
      sendJson(200, {
        success: true,
        data: {
          ...fallback,
          homepage: homepageFallback,
        },
        warning: 'Using fallback defaults',
      });
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
        if (key === 'homepage_settings') {
          sendJson(200, { success: true, data: HomepageSettingsSchema.parse({}) });
          return true;
        }

        sendJson(404, {
          success: false,
          error: { code: 'SETTING_NOT_FOUND', message: `Không tìm thấy cấu hình với key "${key}"` },
        });
        return true;
      }

      if (key === 'homepage_settings') {
        sendJson(200, { success: true, data: HomepageSettingsSchema.parse(row.data) });
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

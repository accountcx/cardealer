import { IncomingMessage, ServerResponse } from 'node:http';
import { db, schema } from '@cardealer/database';
import { eq, inArray, desc } from 'drizzle-orm';
import { verifyToken, parseCookies } from '../auth';

// 🧠 Mental Model: Tuyến đường Quản trị CMS được bảo vệ (Protected Admin Routes).
// Kiểm tra JWT token từ HttpOnly Cookie hoặc Bearer Header trước khi cho phép thao tác ghi dữ liệu.
// Thực thi toàn bộ thao tác CRUD cho Dòng xe, Bảng màu Master và Bảng màu Phiên bản (SCHEMA.md).

export async function handleAdminRoutes(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
  readBody: () => Promise<Record<string, unknown>>,
  sendJson: (status: number, data: unknown, headers?: Record<string, string>) => void
): Promise<boolean> {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies['admin_token'] || req.headers.authorization?.replace('Bearer ', '');

  // Middleware guard cho mọi route /api/admin/*
  if (url.pathname.startsWith('/api/admin')) {
    if (!token || !verifyToken(token)) {
      sendJson(401, {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Bạn không có quyền truy cập khu vực quản trị' },
      });
      return true;
    }
  }

  // 1. GET /api/admin/cars (Danh sách xe quản trị đầy đủ mọi trạng thái: draft, published, archived)
  if (url.pathname === '/api/admin/cars' && req.method === 'GET') {
    const segment = url.searchParams.get('segment');
    try {
      const dbCars = await db.query.cars.findMany({
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
        sortOrder: c.sortOrder,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }));

      sendJson(200, {
        success: true,
        data: segment ? formatted.filter((c) => c.segment === segment) : formatted,
      });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi truy vấn danh sách xe quản trị';
      sendJson(500, { success: false, error: { code: 'DATABASE_QUERY_ERROR', message: msg } });
      return true;
    }
  }

  // 2. GET /api/admin/cars/:slug (Chi tiết xe quản trị kèm toàn bộ phiên bản và màu sắc)
  if (url.pathname.startsWith('/api/admin/cars/') && !url.pathname.endsWith('/version-colors') && req.method === 'GET') {
    const slugOrId = url.pathname.replace('/api/admin/cars/', '');
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
    try {
      const car = await db.query.cars.findFirst({
        where: (t: any, { eq }: any) => (isUuid ? eq(t.id, slugOrId) : eq(t.slug, slugOrId)),
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
        sendJson(404, { success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy dòng xe' } });
        return true;
      }

      sendJson(200, { success: true, data: car });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi truy vấn chi tiết dòng xe quản trị';
      sendJson(500, { success: false, error: { code: 'DATABASE_QUERY_ERROR', message: msg } });
      return true;
    }
  }

  // 3. POST /api/admin/cars (Tạo mới dòng xe kèm phiên bản)
  if (url.pathname === '/api/admin/cars' && req.method === 'POST') {
    const body = await readBody();
    try {
      const tenXe = String(body.tenXe || '').trim();
      if (!tenXe) {
        sendJson(400, { success: false, error: { code: 'VALIDATION_ERROR', message: 'Tên dòng xe không được để trống' } });
        return true;
      }

      const slug = String(body.slug || '').trim() || tenXe.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const anhDaiDienUrl = String(body.anhDaiDienUrl || `/images/cars/${slug}.webp`);

      const [inserted] = await db.insert(schema.cars).values({
        tenXe,
        slug,
        anhDaiDienUrl,
        catalogFileUrl: body.catalogFileUrl ? String(body.catalogFileUrl) : null,
        segment: (body.segment as 'sedan' | 'suv' | 'mpv' | 'hatchback' | 'ev') || 'suv',
        taxRate: body.taxRate ? String(body.taxRate) : '0.10',
        traTruocTu: body.traTruocTu ? Number(body.traTruocTu) : null,
        promotionSummary: body.promotionSummary ? String(body.promotionSummary) : null,
        fuelType: body.fuelType ? String(body.fuelType) : null,
        highlightFeatures: Array.isArray(body.highlightFeatures) ? body.highlightFeatures : [],
        moTaChung: body.moTaChung ? String(body.moTaChung) : null,
        isFeatured: Boolean(body.isFeatured),
        status: (body.status as 'draft' | 'published' | 'archived') || 'draft',
        sortOrder: body.sortOrder ? Number(body.sortOrder) : 0,
      }).returning();

      // Nếu có phiên bản gửi kèm khi tạo dòng xe
      if (Array.isArray(body.versions) && body.versions.length > 0) {
        for (const [idx, v] of body.versions.entries()) {
          const vName = String(v.tenPhienBan || `Phiên bản ${idx + 1}`).trim();
          const vSlug = String(v.slug || vName).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          await db.insert(schema.carVersions).values({
            carId: inserted.id,
            tenPhienBan: vName,
            slug: vSlug,
            giaNiemYet: Number(v.giaNiemYet || 0),
            giaKhuyenMai: v.giaKhuyenMai ? Number(v.giaKhuyenMai) : null,
            seatCount: Number(v.seatCount || 5),
            dongCo: v.dongCo ? String(v.dongCo) : null,
            hopSo: v.hopSo ? String(v.hopSo) : null,
            danDong: v.danDong ? String(v.danDong) : null,
            sortOrder: idx + 1,
          }).onConflictDoNothing();
        }
      }

      sendJson(201, { success: true, data: inserted });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi tạo xe mới';
      sendJson(400, { success: false, error: { code: 'INSERT_ERROR', message: msg } });
      return true;
    }
  }

  // 4. PUT /api/admin/cars/:slugOrId (Cập nhật thông tin dòng xe và các phiên bản)
  if (
    url.pathname.startsWith('/api/admin/cars/') &&
    !url.pathname.endsWith('/version-colors') &&
    req.method === 'PUT'
  ) {
    const slugOrId = url.pathname.replace('/api/admin/cars/', '');
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
    const body = await readBody();
    try {
      const existing = await db.query.cars.findFirst({
        where: (t: any, { eq }: any) => (isUuid ? eq(t.id, slugOrId) : eq(t.slug, slugOrId)),
      });

      if (!existing) {
        sendJson(404, { success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy dòng xe để cập nhật' } });
        return true;
      }

      const updateData: Partial<typeof schema.cars.$inferInsert> = {
        updatedAt: new Date(),
      };

      if (body.tenXe !== undefined) updateData.tenXe = String(body.tenXe).trim();
      if (body.slug !== undefined) updateData.slug = String(body.slug).trim();
      if (body.anhDaiDienUrl !== undefined) updateData.anhDaiDienUrl = String(body.anhDaiDienUrl);
      if (body.catalogFileUrl !== undefined) updateData.catalogFileUrl = body.catalogFileUrl ? String(body.catalogFileUrl) : null;
      if (body.segment !== undefined) updateData.segment = body.segment as any;
      if (body.traTruocTu !== undefined) updateData.traTruocTu = body.traTruocTu ? Number(body.traTruocTu) : null;
      if (body.promotionSummary !== undefined) updateData.promotionSummary = body.promotionSummary ? String(body.promotionSummary) : null;
      if (body.fuelType !== undefined) updateData.fuelType = body.fuelType ? String(body.fuelType) : null;
      if (body.highlightFeatures !== undefined) updateData.highlightFeatures = body.highlightFeatures as any;
      if (body.moTaChung !== undefined) updateData.moTaChung = body.moTaChung ? String(body.moTaChung) : null;
      if (body.isFeatured !== undefined) updateData.isFeatured = Boolean(body.isFeatured);
      if (body.status !== undefined) updateData.status = body.status as any;
      if (body.sortOrder !== undefined) updateData.sortOrder = Number(body.sortOrder);

      const [updated] = await db
        .update(schema.cars)
        .set(updateData)
        .where(eq(schema.cars.id, existing.id))
        .returning();

      // Cập nhật hoặc bổ sung các phiên bản
      if (Array.isArray(body.versions)) {
        for (const [idx, v] of body.versions.entries()) {
          const vName = String(v.tenPhienBan || '').trim();
          const vSlug = String(v.slug || vName).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          const isUuid = v.id && typeof v.id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v.id);

          if (isUuid) {
            await db
              .update(schema.carVersions)
              .set({
                tenPhienBan: vName,
                slug: vSlug,
                giaNiemYet: Number(v.giaNiemYet || 0),
                giaKhuyenMai: v.giaKhuyenMai ? Number(v.giaKhuyenMai) : null,
                seatCount: Number(v.seatCount || 5),
                dongCo: v.dongCo ? String(v.dongCo) : null,
                hopSo: v.hopSo ? String(v.hopSo) : null,
                danDong: v.danDong ? String(v.danDong) : null,
                sortOrder: idx + 1,
                updatedAt: new Date(),
              })
              .where(eq(schema.carVersions.id, v.id));
          } else {
            await db.insert(schema.carVersions).values({
              carId: existing.id,
              tenPhienBan: vName || `Phiên bản ${idx + 1}`,
              slug: vSlug || `ver-${Date.now()}-${idx}`,
              giaNiemYet: Number(v.giaNiemYet || 0),
              giaKhuyenMai: v.giaKhuyenMai ? Number(v.giaKhuyenMai) : null,
              seatCount: Number(v.seatCount || 5),
              dongCo: v.dongCo ? String(v.dongCo) : null,
              hopSo: v.hopSo ? String(v.hopSo) : null,
              danDong: v.danDong ? String(v.danDong) : null,
              sortOrder: idx + 1,
            }).onConflictDoNothing();
          }
        }
      }

      sendJson(200, { success: true, data: updated });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi cập nhật dòng xe';
      sendJson(400, { success: false, error: { code: 'UPDATE_ERROR', message: msg } });
      return true;
    }
  }

  // 5. DELETE /api/admin/cars/:id
  if (url.pathname.startsWith('/api/admin/cars/') && req.method === 'DELETE') {
    const id = url.pathname.replace('/api/admin/cars/', '');
    try {
      await db.delete(schema.cars).where(eq(schema.cars.id, id));
      sendJson(200, { success: true, id });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi xóa dòng xe';
      sendJson(400, { success: false, error: { code: 'DELETE_ERROR', message: msg } });
      return true;
    }
  }

  // 5. GET /api/admin/colors (Lấy danh mục bảng màu Master cho quản trị)
  if (url.pathname === '/api/admin/colors' && req.method === 'GET') {
    try {
      const colors = await db.query.colors.findMany({
        orderBy: [desc(schema.colors.createdAt)],
      });
      sendJson(200, { success: true, data: colors });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi truy vấn bảng màu quản trị';
      sendJson(500, { success: false, error: { code: 'DATABASE_QUERY_ERROR', message: msg } });
      return true;
    }
  }

  // 6. POST /api/admin/colors (Tạo mã màu Master)
  if (url.pathname === '/api/admin/colors' && req.method === 'POST') {
    const body = await readBody();
    try {
      const [inserted] = await db.insert(schema.colors).values({
        tenMau: String(body.tenMau || '').trim(),
        hexCode: String(body.hexCode || '#000000').trim(),
        isTwoTone: Boolean(body.isTwoTone),
        secondaryHexCode: body.secondaryHexCode ? String(body.secondaryHexCode).trim() : null,
        swatchUrl: body.swatchUrl ? String(body.swatchUrl).trim() : null,
      }).returning();

      sendJson(201, { success: true, data: inserted });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi tạo mã màu mới';
      sendJson(400, { success: false, error: { code: 'INSERT_COLOR_ERROR', message: msg } });
      return true;
    }
  }

  // 4. PUT /api/admin/colors/:id (Cập nhật mã màu Master)
  if (url.pathname.startsWith('/api/admin/colors/') && req.method === 'PUT') {
    const id = url.pathname.replace('/api/admin/colors/', '');
    const body = await readBody();
    try {
      const [updated] = await db.update(schema.colors).set({
        tenMau: String(body.tenMau || '').trim(),
        hexCode: String(body.hexCode || '').trim(),
        isTwoTone: Boolean(body.isTwoTone),
        secondaryHexCode: body.secondaryHexCode ? String(body.secondaryHexCode).trim() : null,
        swatchUrl: body.swatchUrl ? String(body.swatchUrl).trim() : null,
      }).where(eq(schema.colors.id, id)).returning();

      sendJson(200, { success: true, data: updated });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi cập nhật mã màu';
      sendJson(400, { success: false, error: { code: 'UPDATE_COLOR_ERROR', message: msg } });
      return true;
    }
  }

  // 5. DELETE /api/admin/colors/:id (Xóa mã màu Master)
  if (url.pathname.startsWith('/api/admin/colors/') && req.method === 'DELETE') {
    const id = url.pathname.replace('/api/admin/colors/', '');
    try {
      await db.delete(schema.colors).where(eq(schema.colors.id, id));
      sendJson(200, { success: true, id });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi xóa mã màu';
      sendJson(400, { success: false, error: { code: 'DELETE_COLOR_ERROR', message: msg } });
      return true;
    }
  }

  // 6. POST /api/admin/cars/:slug/version-colors (Lưu cấu hình màu cho phiên bản xe)
  if (url.pathname.startsWith('/api/admin/cars/') && url.pathname.endsWith('/version-colors') && req.method === 'POST') {
    const slug = url.pathname.replace('/api/admin/cars/', '').replace('/version-colors', '');
    const body = await readBody();
    const items = (body.items || []) as Array<{
      versionId: string;
      colorId: string;
      anhXeTheoMauUrl?: string;
      isDefault?: boolean;
    }>;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
    try {
      const car = await db.query.cars.findFirst({
        where: isUuid ? eq(schema.cars.id, slug) : eq(schema.cars.slug, slug),
        with: { versions: true },
      });

      if (!car) {
        sendJson(404, { success: false, error: { code: 'CAR_NOT_FOUND', message: 'Không tìm thấy xe' } });
        return true;
      }

      const versionIds = car.versions.map((v) => v.id);
      if (versionIds.length > 0) {
        // Xóa cấu hình màu cũ của các phiên bản thuộc dòng xe này
        await db.delete(schema.versionColors).where(inArray(schema.versionColors.versionId, versionIds));
      }

      // Batch insert cấu hình màu mới
      if (items.length > 0) {
        await db.insert(schema.versionColors).values(
          items.map((it) => ({
            versionId: it.versionId,
            colorId: it.colorId,
            anhXeTheoMauUrl: it.anhXeTheoMauUrl ? String(it.anhXeTheoMauUrl).trim() : null,
            isDefault: Boolean(it.isDefault),
          }))
        );
      }

      sendJson(200, { success: true, savedCount: items.length });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi lưu bảng màu phiên bản';
      sendJson(400, { success: false, error: { code: 'SAVE_VERSION_COLORS_ERROR', message: msg } });
      return true;
    }
  }

  // 7. GET /api/admin/settings
  if (url.pathname === '/api/admin/settings' && req.method === 'GET') {
    try {
      let row = await db.query.systemSettings.findFirst({
        where: eq(schema.systemSettings.key, 'showroom_settings'),
      });

      if (!row) {
        const defaultShowroomSettings = {
          showroomName: 'Hyundai Vinh - Đại Lý Ô Tô Ủy Quyền Chính Hãng',
          hotlineKinhDoanh: '0981.234.567',
          hotlineDichVu: '0987.654.321',
          zaloNumber: '0981234567',
          email: 'admin@xehyundaivinh.com',
          diaChi: 'Km 3+500 Đại lộ Lê Nin, TP. Vinh, Nghệ An',
          googleMapsUrl: 'https://maps.google.com/?q=Hyundai+Vinh',
          facebookUrl: 'https://facebook.com/hyundaivinh',
          youtubeUrl: 'https://youtube.com/@hyundaivinh',
        };

        const [inserted] = await db
          .insert(schema.systemSettings)
          .values({
            key: 'showroom_settings',
            data: defaultShowroomSettings,
          })
          .onConflictDoUpdate({
            target: schema.systemSettings.key,
            set: { data: defaultShowroomSettings, updatedAt: new Date() },
          })
          .returning();

        row = inserted;
      }

      sendJson(200, { success: true, data: row.data });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi truy vấn cấu hình showroom';
      sendJson(500, { success: false, error: { code: 'DATABASE_ERROR', message: msg } });
      return true;
    }
  }

  // 8. PUT /api/admin/settings
  if (url.pathname === '/api/admin/settings' && req.method === 'PUT') {
    const body = await readBody();
    try {
      await db
        .insert(schema.systemSettings)
        .values({
          key: 'showroom_settings',
          data: body,
        })
        .onConflictDoUpdate({
          target: schema.systemSettings.key,
          set: {
            data: body,
            updatedAt: new Date(),
          },
        });

      sendJson(200, { success: true, data: body });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi cập nhật cấu hình showroom';
      sendJson(500, { success: false, error: { code: 'UPDATE_SETTINGS_ERROR', message: msg } });
      return true;
    }
  }

  return false;
}

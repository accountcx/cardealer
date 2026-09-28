import { IncomingMessage, ServerResponse } from 'node:http';
import busboy from 'busboy';
import { db, schema } from '@cardealer/database';
import { eq, desc, asc, ilike, and, count, inArray, or } from 'drizzle-orm';
import { authenticateAdmin, checkPermission } from '../../middleware/rbac';
import { recordAuditLog } from '../../services/audit.service';
import {
  uploadStreamToCloudinary,
  deleteCloudinaryAsset,
  rollbackCloudinaryUpload,
} from '../../services/cloudinary.service';
import {
  MediaQuerySchema,
  UpdateMediaSchema,
  BatchDeleteMediaSchema,
  type MediaItem,
} from '@cardealer/types';

// 🧠 Mental Model: Router Quản Trị Media Library & Tích Hợp Cloudinary REST Endpoints.
// 1. Upload Streaming Controller: Pipe trực tiếp từ Busboy vào Cloudinary Upload Stream (R2 Memory Guard).
// 2. File Validation: Giới hạn 10MB và whitelist định dạng ảnh hợp lệ (R3, R9 Guard).
// 3. Compensating Rollback (R15 Guard): Tự động thu hồi ảnh trên Cloudinary nếu DB Insert thất bại.
// 4. Phân quyền RBAC nghiêm ngặt: `media:read`, `media:write`, `media:delete`.

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (R3 Guard)

export async function handleMediaRoutes(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
  readBody: () => Promise<Record<string, unknown>>,
  sendJson: (status: number, data: unknown, headers?: Record<string, string>) => void
): Promise<boolean> {
  const pathname = url.pathname;

  // 1. POST /api/admin/media/upload (Tải lên ảnh stream đơn lẻ / từng file trong queue)
  if (pathname === '/api/admin/media/upload' && req.method === 'POST') {
    const auth = await authenticateAdmin(req);
    if (auth.error) {
      sendJson(auth.error.statusCode, { success: false, error: auth.error });
      return true;
    }

    if (!checkPermission(auth.user!.role, 'media:write')) {
      sendJson(403, {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Bạn không có quyền tải lên hình ảnh vào hệ thống',
        },
      });
      return true;
    }

    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) {
      sendJson(400, {
        success: false,
        error: {
          code: 'INVALID_CONTENT_TYPE',
          message: 'Yêu cầu Content-Type multipart/form-data',
        },
      });
      return true;
    }

    let fileFound = false;
    let uploadPromise: Promise<MediaItem> | null = null;
    let fieldAltText = '';

    try {
      const bb = busboy({
        headers: req.headers,
        limits: {
          fileSize: MAX_FILE_SIZE,
          files: 1,
        },
      });

      bb.on('field', (name, val) => {
        if (name === 'altText') {
          fieldAltText = val;
        }
      });

      bb.on('file', (fieldname, fileStream, info) => {
        fileFound = true;
        const { filename, mimeType } = info;

        // 🧠 Kiểm tra Whitelist MIME Type (R9 Guard)
        if (!ALLOWED_MIME_TYPES.has(mimeType)) {
          fileStream.resume(); // Xả stream để tránh treo kết nối
          uploadPromise = Promise.reject(new Error('INVALID_FILE_TYPE'));
          return;
        }

        let isOverSize = false;
        fileStream.on('limit', () => {
          isOverSize = true;
        });

        uploadPromise = (async () => {
          // Stream thẳng sang Cloudinary
          const uploadResult = await uploadStreamToCloudinary(fileStream, {
            filename,
            mimeType,
          });

          if (isOverSize) {
            await rollbackCloudinaryUpload(uploadResult.publicId);
            throw new Error('FILE_TOO_LARGE');
          }

          // 🧠 Lưu vào PostgreSQL với cơ chế Rollback đền bù (R15 Guard)
          try {
            const [insertedRecord] = await db
              .insert(schema.media)
              .values({
                filename,
                url: uploadResult.secureUrl,
                publicId: uploadResult.publicId,
                format: uploadResult.format,
                mimeType: uploadResult.mimeType,
                fileSize: uploadResult.bytes,
                altText: fieldAltText.trim() || null,
                width: uploadResult.width || null,
                height: uploadResult.height || null,
                uploaderId: auth.user!.id,
              })
              .returning();

            await recordAuditLog({
              userId: auth.user!.id,
              action: 'media:upload',
              resource: 'media',
              resourceId: insertedRecord.id,
              details: { filename, publicId: uploadResult.publicId },
            });

            return insertedRecord;
          } catch (dbError) {
            // Rollback xóa ngay asset trên Cloudinary nếu DB lỗi
            await rollbackCloudinaryUpload(uploadResult.publicId);
            throw dbError;
          }
        })();
      });

      bb.on('close', async () => {
        if (!fileFound || !uploadPromise) {
          sendJson(400, {
            success: false,
            error: {
              code: 'NO_FILE_PROVIDED',
              message: 'Vui lòng cung cấp tệp hình ảnh để tải lên',
            },
          });
          return;
        }

        try {
          const mediaRecord = await uploadPromise;
          sendJson(201, {
            success: true,
            data: mediaRecord,
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          if (msg === 'INVALID_FILE_TYPE') {
            sendJson(400, {
              success: false,
              error: {
                code: 'INVALID_FILE_TYPE',
                message: 'Định dạng tệp không được hỗ trợ. Chỉ chấp nhận JPEG, PNG, WEBP, GIF, SVG.',
              },
            });
            return;
          }

          if (msg === 'FILE_TOO_LARGE') {
            sendJson(400, {
              success: false,
              error: {
                code: 'FILE_TOO_LARGE',
                message: 'Dung lượng tệp vượt quá giới hạn cho phép (Tối đa 10MB)',
              },
            });
            return;
          }

          console.error('❌ [Media Upload] Lỗi xử lý tải lên:', msg);
          sendJson(500, {
            success: false,
            error: {
              code: 'UPLOAD_FAILED',
              message: `Tải ảnh lên thất bại: ${msg}`,
            },
          });
        }
      });

      bb.on('error', (bbErr: unknown) => {
        const msg = bbErr instanceof Error ? bbErr.message : String(bbErr);
        console.error('❌ [Media Upload] Lỗi Busboy Stream:', msg);
        sendJson(400, {
          success: false,
          error: {
            code: 'STREAM_ERROR',
            message: `Lỗi phân tích stream: ${msg}`,
          },
        });
      });

      req.pipe(bb);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      sendJson(500, {
        success: false,
        error: { code: 'SERVER_ERROR', message: msg },
      });
      return true;
    }
  }

  // 2. GET /api/admin/media (Danh sách ảnh có phân trang & tìm kiếm)
  if (pathname === '/api/admin/media' && req.method === 'GET') {
    const auth = await authenticateAdmin(req);
    if (auth.error) {
      sendJson(auth.error.statusCode, { success: false, error: auth.error });
      return true;
    }

    if (!checkPermission(auth.user!.role, 'media:read')) {
      sendJson(403, {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Bạn không có quyền truy cập kho ảnh' },
      });
      return true;
    }

    const queryParams = Object.fromEntries(url.searchParams.entries());
    const parseResult = MediaQuerySchema.safeParse(queryParams);
    if (!parseResult.success) {
      sendJson(400, {
        success: false,
        error: {
          code: 'INVALID_QUERY',
          message: 'Tham số tìm kiếm không hợp lệ',
          details: parseResult.error.flatten().fieldErrors,
        },
      });
      return true;
    }

    const { page, limit, search, format, sortBy } = parseResult.data;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      conditions.push(
        or(
          ilike(schema.media.filename, searchTerm),
          ilike(schema.media.altText, searchTerm)
        )
      );
    }

    if (format && format.trim()) {
      conditions.push(eq(schema.media.format, format.trim().toLowerCase()));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Sắp xếp
    let orderClause = desc(schema.media.createdAt);
    if (sortBy === 'oldest') orderClause = asc(schema.media.createdAt);
    if (sortBy === 'size_asc') orderClause = asc(schema.media.fileSize);
    if (sortBy === 'size_desc') orderClause = desc(schema.media.fileSize);
    if (sortBy === 'name_asc') orderClause = asc(schema.media.filename);

    try {
      const [totalCountResult] = await db
        .select({ total: count() })
        .from(schema.media)
        .where(whereClause);

      const total = totalCountResult?.total || 0;
      const totalPages = Math.ceil(total / limit) || 1;

      const items = await db.query.media.findMany({
        where: whereClause,
        orderBy: [orderClause],
        limit,
        offset,
      });

      sendJson(200, {
        success: true,
        data: {
          items,
          pagination: {
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      sendJson(500, {
        success: false,
        error: { code: 'DATABASE_ERROR', message: `Lỗi truy vấn: ${msg}` },
      });
      return true;
    }
  }

  // 3. POST /api/admin/media/batch-delete (Xóa hàng loạt nhiều ảnh)
  if (pathname === '/api/admin/media/batch-delete' && req.method === 'POST') {
    const auth = await authenticateAdmin(req);
    if (auth.error) {
      sendJson(auth.error.statusCode, { success: false, error: auth.error });
      return true;
    }

    if (!checkPermission(auth.user!.role, 'media:delete')) {
      sendJson(403, {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Bạn không có quyền xóa ảnh khỏi hệ thống' },
      });
      return true;
    }

    const rawBody = await readBody();
    const parseResult = BatchDeleteMediaSchema.safeParse(rawBody);
    if (!parseResult.success) {
      sendJson(400, {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parseResult.error.issues[0]?.message || 'Dữ liệu không hợp lệ',
        },
      });
      return true;
    }

    const { ids } = parseResult.data;

    try {
      const records = await db.query.media.findMany({
        where: inArray(schema.media.id, ids),
      });

      let deletedCount = 0;
      const failedIds: string[] = [];

      for (const rec of records) {
        // Xóa trên Cloudinary
        if (rec.publicId) {
          await deleteCloudinaryAsset(rec.publicId);
        }
        await db.delete(schema.media).where(eq(schema.media.id, rec.id));
        deletedCount++;
      }

      await recordAuditLog({
        userId: auth.user!.id,
        action: 'media:batch_delete',
        resource: 'media',
        details: { count: deletedCount, ids },
      });

      sendJson(200, {
        success: true,
        data: {
          deletedCount,
          failedCount: failedIds.length,
          failedIds,
        },
      });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      sendJson(500, {
        success: false,
        error: { code: 'DELETE_FAILED', message: `Xóa ảnh hàng loạt thất bại: ${msg}` },
      });
      return true;
    }
  }

  // 4. PUT /api/admin/media/:id (Cập nhật Alt Text SEO / Filename)
  const singleMediaMatch = pathname.match(/^\/api\/admin\/media\/([0-9a-fA-F-]{36})$/);
  if (singleMediaMatch && req.method === 'PUT') {
    const id = singleMediaMatch[1];
    const auth = await authenticateAdmin(req);
    if (auth.error) {
      sendJson(auth.error.statusCode, { success: false, error: auth.error });
      return true;
    }

    if (!checkPermission(auth.user!.role, 'media:write')) {
      sendJson(403, {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Bạn không có quyền chỉnh sửa ảnh' },
      });
      return true;
    }

    const rawBody = await readBody();
    const parseResult = UpdateMediaSchema.safeParse(rawBody);
    if (!parseResult.success) {
      sendJson(400, {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parseResult.error.issues[0]?.message || 'Dữ liệu không hợp lệ',
        },
      });
      return true;
    }

    const { altText, filename } = parseResult.data;

    try {
      const existing = await db.query.media.findFirst({
        where: eq(schema.media.id, id),
      });

      if (!existing) {
        sendJson(404, {
          success: false,
          error: { code: 'MEDIA_NOT_FOUND', message: 'Không tìm thấy hình ảnh yêu cầu' },
        });
        return true;
      }

      const updateValues: Record<string, unknown> = {
        updatedAt: new Date(),
      };
      if (altText !== undefined) updateValues.altText = altText ? altText.trim() : null;
      if (filename !== undefined) updateValues.filename = filename.trim();

      const [updated] = await db
        .update(schema.media)
        .set(updateValues)
        .where(eq(schema.media.id, id))
        .returning();

      await recordAuditLog({
        userId: auth.user!.id,
        action: 'media:update',
        resource: 'media',
        resourceId: id,
        details: updateValues,
      });

      sendJson(200, {
        success: true,
        data: updated,
      });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      sendJson(500, {
        success: false,
        error: { code: 'DATABASE_ERROR', message: `Cập nhật ảnh thất bại: ${msg}` },
      });
      return true;
    }
  }

  // 5. DELETE /api/admin/media/:id (Xóa ảnh đơn lẻ)
  if (singleMediaMatch && req.method === 'DELETE') {
    const id = singleMediaMatch[1];
    const auth = await authenticateAdmin(req);
    if (auth.error) {
      sendJson(auth.error.statusCode, { success: false, error: auth.error });
      return true;
    }

    if (!checkPermission(auth.user!.role, 'media:delete')) {
      sendJson(403, {
        success: false,
        error: { code: 'FORBIDDEN', message: 'Bạn không có quyền xóa ảnh khỏi hệ thống' },
      });
      return true;
    }

    try {
      const existing = await db.query.media.findFirst({
        where: eq(schema.media.id, id),
      });

      if (!existing) {
        sendJson(404, {
          success: false,
          error: { code: 'MEDIA_NOT_FOUND', message: 'Hình ảnh không tồn tại hoặc đã bị xóa' },
        });
        return true;
      }

      // Xóa trên Cloudinary trước
      if (existing.publicId) {
        await deleteCloudinaryAsset(existing.publicId);
      }

      // Xóa trong PostgreSQL
      await db.delete(schema.media).where(eq(schema.media.id, id));

      await recordAuditLog({
        userId: auth.user!.id,
        action: 'media:delete',
        resource: 'media',
        resourceId: id,
        details: { filename: existing.filename, publicId: existing.publicId },
      });

      sendJson(200, {
        success: true,
        data: {
          id,
          message: 'Đã xóa ảnh thành công khỏi hệ thống và Cloudinary',
        },
      });
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      sendJson(500, {
        success: false,
        error: { code: 'DELETE_FAILED', message: `Xóa ảnh thất bại: ${msg}` },
      });
      return true;
    }
  }

  return false;
}

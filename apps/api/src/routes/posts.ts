import { IncomingMessage, ServerResponse } from 'node:http';
import crypto from 'node:crypto';
import { db, schema } from '@cardealer/database';
import { eq, desc, asc, and, or, ilike, count, sql, ne } from 'drizzle-orm';
import {
  CreatePostInputSchema,
  UpdatePostInputSchema,
  createCategorySchema,
  updateCategorySchema,
  hasPermission,
  type Role,
} from '@cardealer/types';
import { calculateReadingTimeAndWordCount, extractTextFromTiptap, slugifyVietnamese } from '@cardealer/core';
import { authenticateAdmin } from '../middleware/rbac';

// 🧠 Mental Model: Router Quản Trị Biên Tập Bài Viết & Inbound Lead Receiver (CMS Posts Engine).
// 1. RBAC Guard: Bắt buộc xác thực JWT token và phân quyền chặt chẽ ('posts:read', 'posts:write').
// 2. Publish Gatekeeper: Chặn tuyệt đối việc xuất bản bài viết nếu nội dung chứa ký tự giữ chỗ chưa hoàn thiện [...] hoặc [todo].
// 3. Tự Động Sinh 301 Redirect: Khi Slug bài viết thay đổi, tự động tạo bản ghi trong bảng redirects để bảo toàn 100% PageRank.
// 4. Inbound Lead Receiver & Honeypot Guard: Tiếp nhận Leads từ InlineQuickForm và GatedContent, silent-drop bot spam.
// 5. Preview Token Engine: Sinh token bảo mật 64 ký tự cho phép xem trước bài viết nháp mà không cần tài khoản admin.

export async function handlePostRoutes(
  req: IncomingMessage,
  res: ServerResponse,
  url: URL,
  readBody: () => Promise<Record<string, unknown>>,
  sendJson: (status: number, data: unknown, headers?: Record<string, string>) => void
): Promise<boolean> {
  const pathname = url.pathname;
  const method = req.method || 'GET';

  // ==========================================================================
  // 1. PUBLIC ROUTES: PREVIEW BÀI VIẾT & INBOUND LEAD
  // ==========================================================================

  // 1.1. GET /api/posts/preview?token=... (Xem trước bài viết nháp bí mật)
  if (pathname === '/api/posts/preview' && method === 'GET') {
    const token = url.searchParams.get('token');
    if (!token || token.length < 16) {
      sendJson(400, {
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Token xem trước không hợp lệ hoặc thiếu' },
      });
      return true;
    }

    try {
      const post = await db.query.posts.findFirst({
        where: eq(schema.posts.previewToken, token),
        with: {
          category: true,
          author: {
            columns: {
              id: true,
              fullName: true,
              role: true,
              phone: true,
              avatarUrl: true,
            },
          },
          tags: true,
        },
      });

      if (!post) {
        sendJson(404, {
          success: false,
          error: { code: 'NOT_FOUND', message: 'Không tìm thấy bài viết tương ứng với token xem trước' },
        });
        return true;
      }

      sendJson(200, {
        success: true,
        data: post,
      });
      return true;
    } catch (err: unknown) {
      console.error('[Posts Preview] Lỗi truy vấn:', err);
      sendJson(500, {
        success: false,
        error: { code: 'DB_ERROR', message: 'Lỗi truy vấn bài viết xem trước' },
      });
      return true;
    }
  }

  // 1.2. POST /api/leads/inbound (Tiếp nhận Lead từ Content Blocks kèm Honeypot)
  if (pathname === '/api/leads/inbound' && method === 'POST') {
    try {
      const body = await readBody();

      // Honeypot Spam Check: Bot thường tự động điền các trường ẩn này
      const honeypot = body['hp_company'] || body['website'] || body['company_name'];
      if (honeypot && String(honeypot).trim().length > 0) {
        // Silent drop: Trả về thành công giả lập để đánh lừa bot mà không lưu DB
        sendJson(200, {
          success: true,
          data: { id: crypto.randomUUID(), message: 'Yêu cầu của bạn đã được ghi nhận' },
        });
        return true;
      }

      // Chuẩn hóa payload
      const phone = String(body.phone || body.soDienThoai || '').trim();
      const fullName = String(body.fullName || body.hoTen || 'Khách hàng quan tâm').trim();
      const carModelInterested = body.carModelInterested ? String(body.carModelInterested).trim() : null;
      const postId = body.postId ? String(body.postId) : null;
      const authorId = body.authorId ? String(body.authorId) : null;
      const sourceType = body.sourceType ? String(body.sourceType) : 'inbound_post';
      const utmSource = body.utmSource ? String(body.utmSource) : null;
      const utmMedium = body.utmMedium ? String(body.utmMedium) : null;
      const utmCampaign = body.utmCampaign ? String(body.utmCampaign) : null;

      // Validate định dạng SĐT Việt Nam (10 chữ số, bắt đầu bằng 0)
      const phoneRegex = /^(0)(3|5|7|8|9)[0-9]{8}$/;
      if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
        sendJson(400, {
          success: false,
          error: { code: 'INVALID_PHONE', message: 'Số điện thoại không đúng định dạng di động 10 số Việt Nam' },
        });
        return true;
      }

      const [newLead] = await db
        .insert(schema.leads)
        .values({
          fullName,
          phone,
          status: 'new',
          carModelInterested,
          postId: postId || undefined,
          authorId: authorId || undefined,
          sourceType,
          utmSource,
          utmMedium,
          utmCampaign,
          notes: body.notes ? String(body.notes) : 'Khách đăng ký nhận báo giá / mở khóa nội dung bài viết',
        })
        .returning();

      sendJson(201, {
        success: true,
        data: newLead,
        message: 'Đăng ký nhận báo giá thành công. Tư vấn viên sẽ liên hệ trong 5 phút!',
      });
      return true;
    } catch (err: unknown) {
      console.error('[Inbound Lead] Lỗi lưu lead:', err);
      sendJson(500, {
        success: false,
        error: { code: 'DB_ERROR', message: 'Lỗi ghi nhận thông tin khách hàng' },
      });
      return true;
    }
  }

  // 1.3. GET /api/posts/categories (Danh mục công khai cho Storefront)
  if (pathname === '/api/posts/categories' && method === 'GET') {
    try {
      const publicCategories = await db
        .select({
          id: schema.categories.id,
          tenChuyenMuc: schema.categories.tenChuyenMuc,
          slug: schema.categories.slug,
          moTa: schema.categories.moTa,
          sortOrder: schema.categories.sortOrder,
        })
        .from(schema.categories)
        .orderBy(asc(schema.categories.sortOrder), desc(schema.categories.createdAt));

      sendJson(200, { success: true, data: publicCategories });
      return true;
    } catch (err: unknown) {
      console.error('[Public Categories] Lỗi tải chuyên mục:', err);
      sendJson(500, { success: false, error: { code: 'DB_ERROR', message: 'Lỗi tải chuyên mục bài viết' } });
      return true;
    }
  }

  // 1.4. GET /api/posts (Danh sách bài viết đã xuất bản cho Storefront kèm lọc category & search)
  if (pathname === '/api/posts' && method === 'GET') {
    try {
      const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
      const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit')) || 12));
      const offset = (page - 1) * limit;

      const categoryFilter = url.searchParams.get('category')?.trim() || url.searchParams.get('chuyenMuc')?.trim();
      const searchQuery = url.searchParams.get('search')?.trim() || url.searchParams.get('q')?.trim();

      const conditions = [eq(schema.posts.status, 'published')];

      if (categoryFilter) {
        // Tìm category theo slug hoặc UUID (chỉ đối chiếu UUID khi định dạng hợp lệ để tránh lỗi Postgres 22P02)
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryFilter);
        const foundCategory = await db.query.categories.findFirst({
          where: isUuid
            ? or(
                eq(schema.categories.slug, categoryFilter),
                eq(schema.categories.id, categoryFilter)
              )
            : eq(schema.categories.slug, categoryFilter),
        });

        if (foundCategory) {
          conditions.push(eq(schema.posts.categoryId, foundCategory.id));
        } else {
          // Không tìm thấy chuyên mục tương ứng -> Trả về rỗng
          sendJson(200, {
            success: true,
            data: [],
            pagination: { page, limit, totalItems: 0, totalPages: 0 },
          });
          return true;
        }
      }

      if (searchQuery) {
        conditions.push(ilike(schema.posts.tieuDe, `%${searchQuery}%`));
      }

      const whereClause = and(...conditions);

      const [totalCountResult] = await db
        .select({ total: count() })
        .from(schema.posts)
        .where(whereClause);

      const totalItems = Number(totalCountResult?.total || 0);

      const postsList = await db.query.posts.findMany({
        where: whereClause,
        orderBy: [
          desc(schema.posts.isFeatured),
          asc(schema.posts.featuredOrder),
          desc(schema.posts.createdAt),
        ],
        limit,
        offset,
        with: {
          category: {
            columns: {
              id: true,
              tenChuyenMuc: true,
              slug: true,
            },
          },
          author: {
            columns: {
              id: true,
              fullName: true,
              role: true,
              avatarUrl: true,
              phone: true,
            },
          },
        },
      });

      sendJson(200, {
        success: true,
        data: postsList,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages: Math.ceil(totalItems / limit) || 1,
        },
      });
      return true;
    } catch (err: unknown) {
      console.error('[Public Posts] Lỗi tải danh sách bài viết:', err);
      sendJson(500, { success: false, error: { code: 'DB_ERROR', message: 'Lỗi tải danh sách bài viết' } });
      return true;
    }
  }

  // 1.5. GET /api/posts/:slug (Chi tiết bài viết chuẩn SEO cho Storefront)
  const publicSinglePostMatch = pathname.match(/^\/api\/posts\/([a-zA-Z0-9_-]+)$/);
  if (publicSinglePostMatch && method === 'GET') {
    const postSlug = publicSinglePostMatch[1];
    if (postSlug !== 'preview' && postSlug !== 'categories') {
      try {
        const post = await db.query.posts.findFirst({
          where: and(
            eq(schema.posts.slug, postSlug),
            eq(schema.posts.status, 'published')
          ),
          with: {
            category: {
              columns: {
                id: true,
                tenChuyenMuc: true,
                slug: true,
                moTa: true,
              },
            },
            author: {
              columns: {
                id: true,
                fullName: true,
                role: true,
                avatarUrl: true,
                phone: true,
              },
            },
            tags: true,
          },
        });

        if (!post) {
          sendJson(404, {
            success: false,
            error: { code: 'NOT_FOUND', message: 'Không tìm thấy bài viết' },
          });
          return true;
        }

        // Tăng viewCount trong nền
        db.update(schema.posts)
          .set({ viewCount: sql`${schema.posts.viewCount} + 1` })
          .where(eq(schema.posts.id, post.id))
          .catch((viewErr) => console.error('[Public Post Detail] Lỗi tăng lượt xem:', viewErr));

        sendJson(200, {
          success: true,
          data: post,
        });
        return true;
      } catch (err: unknown) {
        console.error('[Public Post Detail] Lỗi truy vấn bài viết:', err);
        sendJson(500, { success: false, error: { code: 'DB_ERROR', message: 'Lỗi tải chi tiết bài viết' } });
        return true;
      }
    }
  }

  // ==========================================================================
  // 2. ADMIN PROTECTED ROUTES (Yêu cầu JWT Token & RBAC)
  // ==========================================================================

  if (!pathname.startsWith('/api/admin/posts') && !pathname.startsWith('/api/admin/categories')) {
    return false;
  }

  const auth = await authenticateAdmin(req);
  if (auth.error) {
    sendJson(auth.error.statusCode, { success: false, error: auth.error });
    return true;
  }
  const currentUser = auth.user!;
  const userRole = currentUser.role as Role;

  // --------------------------------------------------------------------------
  // 2.1. CHUYÊN MỤC BÀI VIẾT (CATEGORIES) — CRUD, AGGREGATE COUNT & DELETE GUARD
  // --------------------------------------------------------------------------

  const categoryIdMatch = pathname.match(/^\/api\/admin\/categories\/([0-9a-fA-F-]{36})$/);
  const categoryIdParam = categoryIdMatch ? categoryIdMatch[1] : null;

  // 2.1.1. GET /api/admin/categories (Danh sách chuyên mục kèm số bài viết postCount)
  if (pathname === '/api/admin/categories' && method === 'GET') {
    if (!hasPermission(userRole, 'posts:read')) {
      sendJson(403, { success: false, error: { code: 'FORBIDDEN', message: 'Bạn không có quyền xem danh mục bài viết' } });
      return true;
    }

    try {
      // 🧠 Option A Architecture: Single Drizzle SQL Query kết hợp LEFT JOIN và GROUP BY
      const categoriesList = await db
        .select({
          id: schema.categories.id,
          tenChuyenMuc: schema.categories.tenChuyenMuc,
          slug: schema.categories.slug,
          moTa: schema.categories.moTa,
          sortOrder: schema.categories.sortOrder,
          createdAt: schema.categories.createdAt,
          updatedAt: schema.categories.updatedAt,
          postCount: sql<number>`cast(count(${schema.posts.id}) as integer)`,
        })
        .from(schema.categories)
        .leftJoin(schema.posts, eq(schema.posts.categoryId, schema.categories.id))
        .groupBy(schema.categories.id)
        .orderBy(asc(schema.categories.sortOrder), desc(schema.categories.createdAt));

      sendJson(200, { success: true, data: categoriesList });
      return true;
    } catch (err: unknown) {
      console.error('[Admin Categories] Lỗi truy vấn danh mục kèm count:', err);
      sendJson(500, { success: false, error: { code: 'DB_ERROR', message: 'Lỗi tải danh mục bài viết' } });
      return true;
    }
  }

  // 2.1.2. POST /api/admin/categories (Tạo mới chuyên mục + Unique Slug Validation)
  if (pathname === '/api/admin/categories' && method === 'POST') {
    if (!hasPermission(userRole, 'posts:write')) {
      sendJson(403, { success: false, error: { code: 'FORBIDDEN', message: 'Bạn không có quyền tạo chuyên mục' } });
      return true;
    }

    try {
      const body = await readBody();
      const parseResult = createCategorySchema.safeParse(body);
      if (!parseResult.success) {
        sendJson(400, {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: parseResult.error.issues[0]?.message || 'Dữ liệu chuyên mục không hợp lệ',
            details: parseResult.error.flatten(),
          },
        });
        return true;
      }

      const { tenChuyenMuc, slug: inputSlug, moTa, sortOrder } = parseResult.data;
      const slug = inputSlug || slugifyVietnamese(tenChuyenMuc);

      // Kiểm tra Unique Slug
      const existingSlug = await db.query.categories.findFirst({
        where: eq(schema.categories.slug, slug),
      });

      if (existingSlug) {
        sendJson(409, {
          success: false,
          error: {
            code: 'SLUG_CONFLICT',
            message: 'Slug này đã tồn tại trên hệ thống, vui lòng chọn một slug khác.',
          },
        });
        return true;
      }

      const [newCategory] = await db
        .insert(schema.categories)
        .values({
          tenChuyenMuc,
          slug,
          moTa: moTa || null,
          sortOrder: sortOrder ?? 0,
        })
        .returning();

      sendJson(201, {
        success: true,
        data: { ...newCategory, postCount: 0 },
        message: 'Tạo chuyên mục thành công',
      });
      return true;
    } catch (err: unknown) {
      console.error('[Admin Categories] Lỗi tạo chuyên mục:', err);
      sendJson(500, { success: false, error: { code: 'DB_ERROR', message: 'Lỗi tạo mới chuyên mục' } });
      return true;
    }
  }

  // 2.1.3. PUT /api/admin/categories/:id (Cập nhật chuyên mục)
  if (categoryIdParam && method === 'PUT') {
    if (!hasPermission(userRole, 'posts:write')) {
      sendJson(403, { success: false, error: { code: 'FORBIDDEN', message: 'Bạn không có quyền chỉnh sửa chuyên mục' } });
      return true;
    }

    try {
      const body = await readBody();
      const parseResult = updateCategorySchema.safeParse(body);
      if (!parseResult.success) {
        sendJson(400, {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: parseResult.error.issues[0]?.message || 'Dữ liệu cập nhật không hợp lệ',
            details: parseResult.error.flatten(),
          },
        });
        return true;
      }

      const existingCategory = await db.query.categories.findFirst({
        where: eq(schema.categories.id, categoryIdParam),
      });

      if (!existingCategory) {
        sendJson(404, { success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy chuyên mục' } });
        return true;
      }

      // Kiểm tra Unique Slug nếu slug được thay đổi
      if (parseResult.data.slug && parseResult.data.slug !== existingCategory.slug) {
        const conflict = await db.query.categories.findFirst({
          where: and(eq(schema.categories.slug, parseResult.data.slug), ne(schema.categories.id, categoryIdParam)),
        });
        if (conflict) {
          sendJson(409, {
            success: false,
            error: {
              code: 'SLUG_CONFLICT',
              message: 'Slug này đã tồn tại trên hệ thống, vui lòng chọn một slug khác.',
            },
          });
          return true;
        }
      }

      const updateData: Record<string, unknown> = {
        updatedAt: new Date(),
      };
      if (parseResult.data.tenChuyenMuc !== undefined) updateData.tenChuyenMuc = parseResult.data.tenChuyenMuc;
      if (parseResult.data.slug !== undefined) updateData.slug = parseResult.data.slug;
      if (parseResult.data.moTa !== undefined) updateData.moTa = parseResult.data.moTa;
      if (parseResult.data.sortOrder !== undefined) updateData.sortOrder = parseResult.data.sortOrder;

      const [updatedCategory] = await db
        .update(schema.categories)
        .set(updateData)
        .where(eq(schema.categories.id, categoryIdParam))
        .returning();

      sendJson(200, {
        success: true,
        data: updatedCategory,
        message: 'Cập nhật chuyên mục thành công',
      });
      return true;
    } catch (err: unknown) {
      console.error('[Admin Categories] Lỗi cập nhật chuyên mục:', err);
      sendJson(500, { success: false, error: { code: 'DB_ERROR', message: 'Lỗi cập nhật chuyên mục' } });
      return true;
    }
  }

  // 2.1.4. DELETE /api/admin/categories/:id (Chặn xóa an toàn khi còn bài viết liên kết)
  if (categoryIdParam && method === 'DELETE') {
    if (!hasPermission(userRole, 'posts:write')) {
      sendJson(403, { success: false, error: { code: 'FORBIDDEN', message: 'Bạn không có quyền xóa chuyên mục' } });
      return true;
    }

    try {
      const existingCategory = await db.query.categories.findFirst({
        where: eq(schema.categories.id, categoryIdParam),
      });

      if (!existingCategory) {
        sendJson(404, { success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy chuyên mục' } });
        return true;
      }

      // 🧠 Dual-Layer Restrict Guard: Kiểm tra số bài viết đang gán vào chuyên mục
      const [postCountResult] = await db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(schema.posts)
        .where(eq(schema.posts.categoryId, categoryIdParam));

      if (postCountResult && postCountResult.count > 0) {
        sendJson(400, {
          success: false,
          error: {
            code: 'CATEGORY_IN_USE',
            message: `Không thể xóa chuyên mục "${existingCategory.tenChuyenMuc}" vì đang có ${postCountResult.count} bài viết liên kết. Vui lòng chuyển các bài viết sang chuyên mục khác trước khi xóa.`,
          },
        });
        return true;
      }

      await db.delete(schema.categories).where(eq(schema.categories.id, categoryIdParam));

      sendJson(200, {
        success: true,
        message: `Đã xóa chuyên mục "${existingCategory.tenChuyenMuc}" thành công`,
      });
      return true;
    } catch (err: unknown) {
      console.error('[Admin Categories] Lỗi xóa chuyên mục:', err);
      sendJson(500, { success: false, error: { code: 'DB_ERROR', message: 'Lỗi máy chủ khi xóa chuyên mục' } });
      return true;
    }
  }

  // --------------------------------------------------------------------------
  // 2.2. DANH SÁCH BÀI VIẾT (GET /api/admin/posts)
  // --------------------------------------------------------------------------

  if (pathname === '/api/admin/posts' && method === 'GET') {
    if (!hasPermission(userRole, 'posts:read')) {
      sendJson(403, { success: false, error: { code: 'FORBIDDEN', message: 'Bạn không có quyền xem bài viết' } });
      return true;
    }

    try {
      const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
      const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit')) || 20));
      const offset = (page - 1) * limit;

      const statusFilter = url.searchParams.get('status');
      const categoryIdFilter = url.searchParams.get('categoryId');
      const searchQuery = url.searchParams.get('search')?.trim();

      const conditions = [];

      if (statusFilter && ['draft', 'published', 'scheduled', 'archived'].includes(statusFilter)) {
        conditions.push(eq(schema.posts.status, statusFilter as any));
      }

      if (categoryIdFilter) {
        conditions.push(eq(schema.posts.categoryId, categoryIdFilter));
      }

      if (searchQuery) {
        conditions.push(ilike(schema.posts.tieuDe, `%${searchQuery}%`));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      const [totalCountResult] = await db
        .select({ total: count() })
        .from(schema.posts)
        .where(whereClause);

      const totalItems = Number(totalCountResult?.total || 0);

      const postsList = await db.query.posts.findMany({
        where: whereClause,
        orderBy: [desc(schema.posts.createdAt)],
        limit,
        offset,
        with: {
          category: {
            columns: {
              id: true,
              tenChuyenMuc: true,
              slug: true,
            },
          },
          author: {
            columns: {
              id: true,
              fullName: true,
              role: true,
            },
          },
        },
      });

      sendJson(200, {
        success: true,
        data: postsList,
        pagination: {
          page,
          limit,
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
        },
      });
      return true;
    } catch (err: unknown) {
      console.error('[Admin Posts List] Lỗi truy vấn:', err);
      sendJson(500, { success: false, error: { code: 'DB_ERROR', message: 'Lỗi tải danh sách bài viết' } });
      return true;
    }
  }

  // --------------------------------------------------------------------------
  // 2.3. TẠO MỚI BÀI VIẾT (POST /api/admin/posts)
  // --------------------------------------------------------------------------

  if (pathname === '/api/admin/posts' && method === 'POST') {
    if (!hasPermission(userRole, 'posts:write')) {
      sendJson(403, { success: false, error: { code: 'FORBIDDEN', message: 'Bạn không có quyền tạo bài viết' } });
      return true;
    }

    try {
      const rawBody = await readBody();
      const parsed = CreatePostInputSchema.safeParse(rawBody);

      if (!parsed.success) {
        sendJson(400, {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Dữ liệu bài viết không hợp lệ',
            details: parsed.error.format(),
          },
        });
        return true;
      }

      const postData = parsed.data;

      // Publish Gatekeeper: Nếu tạo bài trực tiếp ở trạng thái published, phải kiểm tra placeholder
      if (postData.status === 'published') {
        const textContent = extractTextFromTiptap(postData.noiDung);
        const placeholderRegex = /\[\s*\.\.\.\s*\]|\[\s*…\s*\]|\[cần bổ sung\]|\[todo\]/i;
        if (placeholderRegex.test(textContent)) {
          sendJson(400, {
            success: false,
            error: {
              code: 'UNFINISHED_CONTENT_DETECTED',
              message:
                'Không thể xuất bản bài viết chứa nội dung giữ chỗ chưa hoàn thiện ([...], [cần bổ sung], hoặc [todo]). Vui lòng bổ sung đầy đủ trước khi đăng!',
            },
          });
          return true;
        }
      }

      // Tự động tính readingTime & wordCount từ Tiptap AST
      const { readingTime, wordCount } = calculateReadingTimeAndWordCount(postData.noiDung);

      // Sinh token bảo mật 64 ký tự cho preview nháp
      const previewToken = crypto.randomBytes(32).toString('hex');

      const authorId = postData.authorId || currentUser.id;

      const [newPost] = await db
        .insert(schema.posts)
        .values({
          tieuDe: postData.tieuDe,
          slug: postData.slug,
          categoryId: postData.categoryId,
          authorId,
          anhDaiDienUrl: postData.anhDaiDienUrl,
          anhDaiDienAlt: postData.anhDaiDienAlt,
          tomTat: postData.tomTat || null,
          noiDung: postData.noiDung,
          status: postData.status,
          scheduledAt: postData.scheduledAt ? new Date(postData.scheduledAt) : null,
          expiredPromoDate: postData.expiredPromoDate ? new Date(postData.expiredPromoDate) : null,
          isFeatured: postData.isFeatured,
          featuredOrder: postData.featuredOrder,
          readingTime,
          wordCount,
          metaTitle: postData.metaTitle || null,
          metaDescription: postData.metaDescription || null,
          canonicalUrl: postData.canonicalUrl || null,
          noIndex: postData.noIndex,
          previewToken,
        })
        .returning();

      sendJson(201, {
        success: true,
        data: newPost,
        message: 'Tạo bài viết mới thành công',
      });
      return true;
    } catch (err: unknown) {
      console.error('[Admin Create Post] Lỗi tạo bài viết:', err);
      sendJson(500, {
        success: false,
        error: { code: 'DB_ERROR', message: 'Lỗi tạo bài viết (trùng slug hoặc thiếu dữ liệu)' },
      });
      return true;
    }
  }

  // --------------------------------------------------------------------------
  // 2.4. CHI TIẾT BÀI VIẾT (GET /api/admin/posts/:id)
  // --------------------------------------------------------------------------

  const singlePostMatch = pathname.match(/^\/api\/admin\/posts\/([0-9a-fA-F-]+)$/);

  if (singlePostMatch && method === 'GET') {
    if (!hasPermission(userRole, 'posts:read')) {
      sendJson(403, { success: false, error: { code: 'FORBIDDEN', message: 'Bạn không có quyền xem bài viết' } });
      return true;
    }

    const postId = singlePostMatch[1];
    try {
      const post = await db.query.posts.findFirst({
        where: eq(schema.posts.id, postId),
        with: {
          category: true,
          author: {
            columns: {
              id: true,
              fullName: true,
              role: true,
              avatarUrl: true,
            },
          },
          tags: true,
        },
      });

      if (!post) {
        sendJson(404, { success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy bài viết' } });
        return true;
      }

      if (!post.previewToken) {
        const generatedToken = crypto.randomBytes(32).toString('hex');
        await db.update(schema.posts).set({ previewToken: generatedToken }).where(eq(schema.posts.id, postId));
        post.previewToken = generatedToken;
      }

      sendJson(200, { success: true, data: post });
      return true;
    } catch (err: unknown) {
      console.error('[Admin Get Post] Lỗi truy vấn:', err);
      sendJson(500, { success: false, error: { code: 'DB_ERROR', message: 'Lỗi tải chi tiết bài viết' } });
      return true;
    }
  }

  // --------------------------------------------------------------------------
  // 2.5. CẬP NHẬT BÀI VIẾT (PUT /api/admin/posts/:id)
  // --------------------------------------------------------------------------

  if (singlePostMatch && method === 'PUT') {
    if (!hasPermission(userRole, 'posts:write')) {
      sendJson(403, { success: false, error: { code: 'FORBIDDEN', message: 'Bạn không có quyền sửa bài viết' } });
      return true;
    }

    const postId = singlePostMatch[1];
    try {
      const existingPost = await db.query.posts.findFirst({
        where: eq(schema.posts.id, postId),
      });

      if (!existingPost) {
        sendJson(404, { success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy bài viết để cập nhật' } });
        return true;
      }

      const rawBody = await readBody();
      const parsed = UpdatePostInputSchema.safeParse(rawBody);

      if (!parsed.success) {
        sendJson(400, {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Dữ liệu cập nhật bài viết không hợp lệ',
            details: parsed.error.format(),
          },
        });
        return true;
      }

      const updateData = parsed.data;

      // 🧠 Publish Gatekeeper: Chặn xuất bản nếu bài viết chứa placeholder [...] hoặc [todo]
      const targetStatus = updateData.status || existingPost.status;
      const targetContent = updateData.noiDung || existingPost.noiDung;

      if (targetStatus === 'published') {
        const textContent = extractTextFromTiptap(targetContent);
        const placeholderRegex = /\[\s*\.\.\.\s*\]|\[\s*…\s*\]|\[cần bổ sung\]|\[todo\]/i;
        if (placeholderRegex.test(textContent)) {
          sendJson(400, {
            success: false,
            error: {
              code: 'UNFINISHED_CONTENT_DETECTED',
              message:
                'Không thể xuất bản bài viết chứa nội dung giữ chỗ chưa hoàn thiện ([...], [cần bổ sung], hoặc [todo]). Vui lòng bổ sung đầy đủ trước khi đăng!',
            },
          });
          return true;
        }
      }

      // 🧠 Tự Động Tạo 301 Redirect nếu Slug thay đổi (Bảo toàn 100% PageRank)
      if (updateData.slug && updateData.slug !== existingPost.slug) {
        const oldPath = `/tin-tuc/${existingPost.slug}`;
        const newPath = `/tin-tuc/${updateData.slug}`;

        try {
          await db
            .insert(schema.redirects)
            .values({
              oldPath,
              newPath,
              statusCode: 301,
            })
            .onConflictDoUpdate({
              target: schema.redirects.oldPath,
              set: {
                newPath,
                statusCode: 301,
                updatedAt: new Date(),
              },
            });
          console.log(`[Posts 301 Redirect] Tự động tạo chuyển hướng: ${oldPath} ➔ ${newPath}`);
        } catch (redirectErr) {
          console.error('[Posts 301 Redirect] Lỗi ghi nhận chuyển hướng tự động:', redirectErr);
        }
      }

      // Tính lại readingTime & wordCount nếu nội dung thay đổi
      let stats = {};
      if (updateData.noiDung) {
        const { readingTime, wordCount } = calculateReadingTimeAndWordCount(updateData.noiDung);
        stats = { readingTime, wordCount };
      }

      // Sinh token bảo mật 64 ký tự cho preview nháp nếu chưa có
      const previewToken = existingPost.previewToken || crypto.randomBytes(32).toString('hex');

      const [updatedPost] = await db
        .update(schema.posts)
        .set({
          ...(updateData.tieuDe ? { tieuDe: updateData.tieuDe } : {}),
          ...(updateData.slug ? { slug: updateData.slug } : {}),
          ...(updateData.categoryId ? { categoryId: updateData.categoryId } : {}),
          ...(updateData.authorId !== undefined ? { authorId: updateData.authorId } : {}),
          ...(updateData.anhDaiDienUrl ? { anhDaiDienUrl: updateData.anhDaiDienUrl } : {}),
          ...(updateData.anhDaiDienAlt ? { anhDaiDienAlt: updateData.anhDaiDienAlt } : {}),
          ...(updateData.tomTat !== undefined ? { tomTat: updateData.tomTat } : {}),
          ...(updateData.noiDung ? { noiDung: updateData.noiDung } : {}),
          ...(updateData.status ? { status: updateData.status } : {}),
          ...(updateData.scheduledAt !== undefined
            ? { scheduledAt: updateData.scheduledAt ? new Date(updateData.scheduledAt) : null }
            : {}),
          ...(updateData.expiredPromoDate !== undefined
            ? { expiredPromoDate: updateData.expiredPromoDate ? new Date(updateData.expiredPromoDate) : null }
            : {}),
          ...(updateData.isFeatured !== undefined ? { isFeatured: updateData.isFeatured } : {}),
          ...(updateData.featuredOrder !== undefined ? { featuredOrder: updateData.featuredOrder } : {}),
          ...(updateData.metaTitle !== undefined ? { metaTitle: updateData.metaTitle } : {}),
          ...(updateData.metaDescription !== undefined ? { metaDescription: updateData.metaDescription } : {}),
          ...(updateData.canonicalUrl !== undefined ? { canonicalUrl: updateData.canonicalUrl } : {}),
          ...(updateData.noIndex !== undefined ? { noIndex: updateData.noIndex } : {}),
          previewToken,
          ...stats,
          updatedAt: new Date(),
        })
        .where(eq(schema.posts.id, postId))
        .returning();

      sendJson(200, {
        success: true,
        data: updatedPost,
        message: 'Cập nhật bài viết thành công',
      });
      return true;
    } catch (err: unknown) {
      console.error('[Admin Update Post] Lỗi cập nhật bài viết:', err);
      sendJson(500, { success: false, error: { code: 'DB_ERROR', message: 'Lỗi cập nhật bài viết' } });
      return true;
    }
  }

  // --------------------------------------------------------------------------
  // 2.6. XÓA BÀI VIẾT (DELETE /api/admin/posts/:id)
  // --------------------------------------------------------------------------

  if (singlePostMatch && method === 'DELETE') {
    if (!hasPermission(userRole, 'posts:write')) {
      sendJson(403, { success: false, error: { code: 'FORBIDDEN', message: 'Bạn không có quyền xóa bài viết' } });
      return true;
    }

    const postId = singlePostMatch[1];
    try {
      const [deleted] = await db.delete(schema.posts).where(eq(schema.posts.id, postId)).returning({ id: schema.posts.id });

      if (!deleted) {
        sendJson(404, { success: false, error: { code: 'NOT_FOUND', message: 'Không tìm thấy bài viết để xóa' } });
        return true;
      }

      sendJson(200, { success: true, message: 'Đã xóa bài viết thành công' });
      return true;
    } catch (err: unknown) {
      console.error('[Admin Delete Post] Lỗi xóa bài viết:', err);
      sendJson(500, { success: false, error: { code: 'DB_ERROR', message: 'Lỗi xóa bài viết' } });
      return true;
    }
  }

  return false;
}

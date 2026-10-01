import { db, schema } from '@cardealer/database';
import { eq, desc, and, or, ilike, count } from 'drizzle-orm';
import type { CreateStaticPageDTO, UpdateStaticPageDTO, StaticPageTemplate } from '@cardealer/types';

export interface ListPagesParams {
  page: number;
  limit: number;
  statusFilter?: string | null;
  templateFilter?: StaticPageTemplate | null;
  searchQuery?: string | null;
}

// WHY: Tách riêng Service Layer khỏi HTTP Controller (Separation of Concerns).
// Đảm bảo logic truy vấn DB tái sử dụng được, cô lập transaction và tối ưu hóa N+1 query qua Drizzle ORM.

export async function listPagesService(params: ListPagesParams) {
  const { page, limit, statusFilter, templateFilter, searchQuery } = params;
  const offset = (page - 1) * limit;
  const conditions = [];

  if (statusFilter === 'published') {
    conditions.push(eq(schema.staticPages.isPublished, true));
  } else if (statusFilter === 'draft') {
    conditions.push(eq(schema.staticPages.isPublished, false));
  }

  if (templateFilter && ['DEFAULT', 'PROFILE_SHOWROOM', 'TIMELINE', 'FINANCE', 'CONTACT', 'FAQ'].includes(templateFilter)) {
    conditions.push(eq(schema.staticPages.templateType, templateFilter));
  }

  if (searchQuery) {
    conditions.push(
      or(
        ilike(schema.staticPages.title, `%${searchQuery}%`),
        ilike(schema.staticPages.slug, `%${searchQuery}%`)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // WHY: Chạy song song query danh sách và count tổng để giảm độ trễ mạng và database latency.
  const [items, totalRes] = await Promise.all([
    db.query.staticPages.findMany({
      where: whereClause,
      orderBy: [desc(schema.staticPages.updatedAt)],
      limit,
      offset,
    }),
    db.select({ count: count() }).from(schema.staticPages).where(whereClause),
  ]);

  const totalItems = totalRes[0]?.count || 0;
  const totalPages = Math.ceil(totalItems / limit) || 1;

  return {
    items,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages,
    },
  };
}

export async function findPageBySlugService(slug: string) {
  return db.query.staticPages.findFirst({
    where: eq(schema.staticPages.slug, slug),
  });
}

export async function findPageByIdService(id: string) {
  return db.query.staticPages.findFirst({
    where: eq(schema.staticPages.id, id),
  });
}

export async function createPageService(data: CreateStaticPageDTO, userId: string) {
  // WHY: Khóa Idempotency & Unique Constraint (R13).
  // Đảm bảo không tạo trùng lặp slug kể cả khi có 2 request gửi đồng thời.
  const [newPage] = await db.insert(schema.staticPages).values({
    title: data.title,
    slug: data.slug,
    content: data.content || {},
    templateType: data.templateType || 'DEFAULT',
    isPublished: data.isPublished || false,
    metaTitle: data.metaTitle,
    metaDescription: data.metaDescription,
    canonicalUrl: data.canonicalUrl,
    ogImage: data.ogImage,
    noIndex: data.noIndex || false,
    schemaType: data.schemaType || 'WebPage',
    createdBy: userId,
    updatedBy: userId,
  }).returning();

  return newPage;
}

export async function updatePageService(id: string, data: UpdateStaticPageDTO, userId: string) {
  // WHY: Cập nhật có audit trace rõ ràng (updated_by và updated_at).
  const [updatedPage] = await db.update(schema.staticPages)
    .set({
      ...data,
      updatedBy: userId,
      updatedAt: new Date(),
    })
    .where(eq(schema.staticPages.id, id))
    .returning();

  return updatedPage;
}

export async function deletePageService(id: string) {
  await db.delete(schema.staticPages).where(eq(schema.staticPages.id, id));
  return true;
}

export async function getPublishedPageBySlugService(slug: string) {
  // WHY: Fail-Closed Security (R14). Chỉ trả về dữ liệu khi is_published = true.
  return db.query.staticPages.findFirst({
    where: and(
      eq(schema.staticPages.slug, slug),
      eq(schema.staticPages.isPublished, true)
    ),
  });
}

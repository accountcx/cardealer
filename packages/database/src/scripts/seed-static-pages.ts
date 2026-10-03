import { eq } from 'drizzle-orm';
import { db, schema, queryClient } from '../client';
import { privacyPolicyPage, contactUsPage, aboutUsPage } from '../seeds/static-pages-data-1';
import { installmentGuidePage, warrantyPolicyPage, termsOfServicePage } from '../seeds/static-pages-data-2';

export const CORE_STATIC_PAGES = [
  privacyPolicyPage,
  contactUsPage,
  aboutUsPage,
  installmentGuidePage,
  warrantyPolicyPage,
  termsOfServicePage,
];

// WHY: Nạp hạt giống dữ liệu (Seed Data) cho 6 Static Pages chuẩn SEO & Content Blocks.
// Cơ chế Idempotent: Nếu đã tồn tại slug, cập nhật đầy đủ nội dung mới nhất.
export async function seedStaticPages(dbInstance = db) {
  const results: Array<{ slug: string; status: 'created' | 'updated' }> = [];

  for (const page of CORE_STATIC_PAGES) {
    const existing = await dbInstance.query.staticPages.findFirst({
      where: eq(schema.staticPages.slug, page.slug),
    });

    if (!existing) {
      await dbInstance.insert(schema.staticPages).values({
        title: page.title,
        slug: page.slug,
        templateType: page.templateType,
        schemaType: page.schemaType,
        metaTitle: page.metaTitle,
        metaDescription: page.metaDescription,
        content: page.content,
        isPublished: page.isPublished,
        noIndex: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      results.push({ slug: page.slug, status: 'created' });
    } else {
      await dbInstance
        .update(schema.staticPages)
        .set({
          title: page.title,
          templateType: page.templateType,
          schemaType: page.schemaType,
          metaTitle: page.metaTitle,
          metaDescription: page.metaDescription,
          content: page.content,
          isPublished: page.isPublished,
          updatedAt: new Date(),
        })
        .where(eq(schema.staticPages.slug, page.slug));
      results.push({ slug: page.slug, status: 'updated' });
    }
  }

  return results;
}

// Chạy trực tiếp từ CLI nếu file được gọi độc lập
async function main() {
  console.log('🚀 Bắt đầu nạp 6 Trang Tĩnh Cốt Lõi (Static Pages CMS)...');
  const results = await seedStaticPages(db);
  console.table(results);
  console.log('✅ Hoàn tất nạp hạt giống 6 Trang Tĩnh thành công!');
  await queryClient.end();
}

if (process.env.NODE_ENV !== 'test' && require.main === module) {
  main().catch(async (err) => {
    console.error('❌ Lỗi nạp hạt giống trang tĩnh:', err);
    await queryClient.end();
    process.exit(1);
  });
}

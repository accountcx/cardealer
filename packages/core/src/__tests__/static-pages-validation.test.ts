import { describe, it, expect } from 'vitest';
import { createStaticPageSchema, RESERVED_SLUGS } from '@cardealer/types';

describe('Unit U-02: Static Pages API Zod Schema & Route Guards (TS-03, TS-04, TS-07)', () => {
  it('TS-03: should validate a valid create static page payload successfully', () => {
    const validPayload = {
      title: 'Giới thiệu Showroom Hyundai Vinh 3S',
      slug: 'gioi-thieu',
      content: { type: 'doc', content: [] },
      templateType: 'PROFILE_SHOWROOM',
      isPublished: true,
      metaTitle: 'Giới thiệu Showroom Hyundai Vinh',
      metaDescription: 'Showroom chuẩn 3S chính hãng tại Nghệ An',
      noIndex: false,
      schemaType: 'AboutPage',
    };

    const result = createStaticPageSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.slug).toBe('gioi-thieu');
      expect(result.data.templateType).toBe('PROFILE_SHOWROOM');
    }
  });

  it('TS-04: should reject reserved system slugs (R12 Defense)', () => {
    const reservedList = ['xe', 'dong-xe', 'tin-tuc', 'gia-lan-banh', 'tra-gop', 'admin', 'api'];

    for (const slug of reservedList) {
      const invalidPayload = {
        title: `Test ${slug}`,
        slug,
      };

      const result = createStaticPageSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
      if (!result.success) {
        const slugIssue = result.error.issues.find((i) => i.path.includes('slug'));
        expect(slugIssue).toBeDefined();
        expect(slugIssue?.message).toContain('trùng với đường dẫn cố định');
      }
    }
  });

  it('should reject slugs with special characters, uppercase, or spaces', () => {
    const invalidSlugs = ['Gioi-Thieu', 'gioi thieu', 'gioi_thieu', 'gioi@thieu!'];

    for (const badSlug of invalidSlugs) {
      const result = createStaticPageSchema.safeParse({
        title: 'Trang kiểm tra',
        slug: badSlug,
      });
      expect(result.success).toBe(false);
    }
  });

  it('TS-07: should strip unexpected unknown fields (Mass Assignment Protection - R7)', () => {
    const payloadWithMaliciousFields = {
      title: 'Chính sách bảo mật',
      slug: 'chinh-sach-bao-mat',
      role: 'admin',
      isAdmin: true,
      id: 'hacked-uuid',
    };

    const result = createStaticPageSchema.safeParse(payloadWithMaliciousFields);
    expect(result.success).toBe(true);
    if (result.success) {
      expect((result.data as any).isAdmin).toBeUndefined();
      expect((result.data as any).role).toBeUndefined();
      expect((result.data as any).id).toBeUndefined();
    }
  });

  it('should reject titles shorter than 2 characters', () => {
    const result = createStaticPageSchema.safeParse({
      title: 'A',
      slug: 'hop-le',
    });
    expect(result.success).toBe(false);
  });
});

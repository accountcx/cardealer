import { describe, it, expect } from 'vitest';
import type { StaticPage, CreateStaticPageDTO, StaticPageTemplate, StaticPageSchemaType } from '@cardealer/types';

describe('Unit U-01: Static Pages Contracts & Types Verification', () => {
  it('should conform to StaticPage type interface contract', () => {
    const mockPage: StaticPage = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      title: 'Giới thiệu Showroom Hyundai Vinh',
      slug: 'gioi-thieu',
      content: { type: 'doc', content: [] },
      templateType: 'PROFILE_SHOWROOM',
      isPublished: true,
      metaTitle: 'Giới thiệu Showroom Hyundai Vinh Chuẩn 3S',
      metaDescription: 'Đại lý ủy quyền 3S chính hãng tại Nghệ An',
      canonicalUrl: 'https://xehyundaivinh.com/gioi-thieu',
      ogImage: 'https://media.cardealer.vn/banner.jpg',
      noIndex: false,
      schemaType: 'AboutPage',
      createdBy: null,
      updatedBy: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(mockPage.id).toBe('550e8400-e29b-41d4-a716-446655440000');
    expect(mockPage.slug).toBe('gioi-thieu');
    expect(mockPage.templateType).toBe('PROFILE_SHOWROOM');
    expect(mockPage.isPublished).toBe(true);
    expect(mockPage.noIndex).toBe(false);
    expect(mockPage.schemaType).toBe('AboutPage');
  });

  it('should support all 4 required template types', () => {
    const templates: StaticPageTemplate[] = ['DEFAULT', 'PROFILE_SHOWROOM', 'TIMELINE', 'FINANCE'];
    expect(templates).toHaveLength(4);
    expect(templates).toContain('DEFAULT');
    expect(templates).toContain('PROFILE_SHOWROOM');
    expect(templates).toContain('TIMELINE');
    expect(templates).toContain('FINANCE');
  });

  it('should support all 3 required schema types', () => {
    const schemaTypes: StaticPageSchemaType[] = ['AboutPage', 'HowTo', 'WebPage'];
    expect(schemaTypes).toHaveLength(3);
    expect(schemaTypes).toContain('AboutPage');
    expect(schemaTypes).toContain('HowTo');
    expect(schemaTypes).toContain('WebPage');
  });

  it('should validate CreateStaticPageDTO input contract', () => {
    const newPageInput: CreateStaticPageDTO = {
      title: 'Chính sách bảo mật',
      slug: 'chinh-sach-bao-mat',
      templateType: 'DEFAULT',
      isPublished: false,
      metaTitle: 'Chính sách bảo mật Hyundai',
    };

    expect(newPageInput.title).toBe('Chính sách bảo mật');
    expect(newPageInput.isPublished).toBe(false);
  });
});

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

  it('should support all 6 required template types', () => {
    const templates: StaticPageTemplate[] = [
      'DEFAULT',
      'PROFILE_SHOWROOM',
      'TIMELINE',
      'FINANCE',
      'CONTACT',
      'FAQ',
    ];
    expect(templates).toHaveLength(6);
    expect(templates).toContain('DEFAULT');
    expect(templates).toContain('PROFILE_SHOWROOM');
    expect(templates).toContain('TIMELINE');
    expect(templates).toContain('FINANCE');
    expect(templates).toContain('CONTACT');
    expect(templates).toContain('FAQ');
  });

  it('should support all 6 required schema types', () => {
    const schemaTypes: StaticPageSchemaType[] = [
      'WebPage',
      'AboutPage',
      'HowTo',
      'FinancialProduct',
      'ContactPage',
      'FAQPage',
    ];
    expect(schemaTypes).toHaveLength(6);
    expect(schemaTypes).toContain('WebPage');
    expect(schemaTypes).toContain('AboutPage');
    expect(schemaTypes).toContain('HowTo');
    expect(schemaTypes).toContain('FinancialProduct');
    expect(schemaTypes).toContain('ContactPage');
    expect(schemaTypes).toContain('FAQPage');
  });

  it('should automatically map each Template to its corresponding default Schema.org type', async () => {
    const { TEMPLATE_DEFAULT_SCHEMA } = await import('@cardealer/types');
    expect(TEMPLATE_DEFAULT_SCHEMA.DEFAULT).toBe('WebPage');
    expect(TEMPLATE_DEFAULT_SCHEMA.PROFILE_SHOWROOM).toBe('AboutPage');
    expect(TEMPLATE_DEFAULT_SCHEMA.TIMELINE).toBe('HowTo');
    expect(TEMPLATE_DEFAULT_SCHEMA.FINANCE).toBe('FinancialProduct');
    expect(TEMPLATE_DEFAULT_SCHEMA.CONTACT).toBe('ContactPage');
    expect(TEMPLATE_DEFAULT_SCHEMA.FAQ).toBe('FAQPage');
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

import React from 'react';
import type { StaticPage } from '@cardealer/types';
import { clientEnv } from '@cardealer/env';

interface StaticPageJsonLdProps {
  page: StaticPage;
}

// WHY: Schema.org Structured Data Generator (Mental Model Dynamic Resolver).
// Tự động phân giải cấu trúc JSON-LD tương thích 100% với Google Rich Results theo schemaType đã cấu hình.
export function StaticPageJsonLd({ page }: StaticPageJsonLdProps) {
  const siteUrl = clientEnv.NEXT_PUBLIC_SITE_URL || 'https://cardealer.vn';
  const pageUrl = page.canonicalUrl || `${siteUrl}/${page.slug}`;
  const schemaType = page.schemaType || 'WebPage';

  let schemaData: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    '@id': pageUrl,
    url: pageUrl,
    name: page.metaTitle || page.title,
    description: page.metaDescription || page.title,
    datePublished: page.createdAt,
    dateModified: page.updatedAt,
    inLanguage: 'vi-VN',
  };

  if (schemaType === 'AboutPage') {
    schemaData = {
      ...schemaData,
      mainEntity: {
        '@type': 'AutoDealer',
        name: 'Showroom Hyundai Vinh',
        url: siteUrl,
      },
    };
  } else if (schemaType === 'ContactPage') {
    schemaData = {
      ...schemaData,
      mainEntity: {
        '@type': 'AutoDealer',
        name: 'Showroom Hyundai Vinh',
        telephone: '+84912345678',
        email: 'info@cardealer.vn',
      },
    };
  } else if (schemaType === 'FinancialProduct') {
    schemaData = {
      ...schemaData,
      category: 'Auto Loan & Financing',
      provider: {
        '@type': 'AutoDealer',
        name: 'Hyundai Vinh Finance',
      },
    };
  } else if (schemaType === 'FAQPage') {
    schemaData = {
      ...schemaData,
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Quy trình mua xe tại Hyundai Vinh gồm những bước nào?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Bao gồm chọn xe, lái thử, ký hợp đồng đặt cọc, hỗ trợ thủ tục trả góp và bàn giao xe tận nơi.',
          },
        },
      ],
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}

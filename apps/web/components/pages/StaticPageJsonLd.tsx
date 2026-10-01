import React from 'react';
import type { StaticPage } from '@cardealer/types';
import { generateStaticPageJsonLd, sanitizeJsonLd, type AutoDealerInfo } from '@cardealer/core';
import { clientEnv } from '@cardealer/env';

interface StaticPageJsonLdProps {
  page: StaticPage;
  dealerInfo?: AutoDealerInfo;
}

// WHY: Schema.org Structured Data Generator (Mental Model Dynamic Resolver).
// Tự động phân giải cấu trúc JSON-LD tương thích 100% với Google Rich Results theo schemaType đã cấu hình.
// Áp dụng bóc tách động từ Tiptap AST (FAQ/Steps), nạp thông tin đại lý từ Settings và escape chống XSS (CWE-79).
export function StaticPageJsonLd({ page, dealerInfo }: StaticPageJsonLdProps) {
  const siteUrl = clientEnv.NEXT_PUBLIC_SITE_URL;

  const schemaData = generateStaticPageJsonLd(page, {
    siteUrl,
    dealer: dealerInfo,
  });

  const sanitizedJson = sanitizeJsonLd(schemaData);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: sanitizedJson }}
    />
  );
}

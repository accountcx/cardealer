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
  } else if (schemaType === 'HowTo') {
    schemaData = {
      ...schemaData,
      step: [
        {
          '@type': 'HowToStep',
          name: 'Bước 1: Chọn mẫu xe và đăng ký lái thử',
          text: 'Tham khảo thông số, hình ảnh và trải nghiệm lái thử thực tế tại showroom hoặc tại nhà.',
        },
        {
          '@type': 'HowToStep',
          name: 'Bước 2: Nhận báo giá lăn bánh và ưu đãi',
          text: 'Nhận bảng dự toán chi tiết các khoản thuế phí và chương trình khuyến mãi tiền mặt.',
        },
        {
          '@type': 'HowToStep',
          name: 'Bước 3: Ký hợp đồng và thẩm định hồ sơ trả góp',
          text: 'Ký kết hợp đồng mua bán minh bạch và hỗ trợ phê duyệt hồ sơ vay vốn ngân hàng trong 24 giờ.',
        },
        {
          '@type': 'HowToStep',
          name: 'Bước 4: Bàn giao xe trang trọng và hậu mãi',
          text: 'Kiểm định PDI tiêu chuẩn, bàn giao xe tại showroom hoặc giao xe tận nhà an tâm.',
        },
      ],
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

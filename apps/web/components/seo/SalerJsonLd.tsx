import type { ContactSettings, SiteSettings, FloatingSellerSettings } from '@cardealer/types';
import { getSiteUrl } from '@cardealer/env';

export interface SalerJsonLdProps {
  contact: ContactSettings;
  site: SiteSettings;
  floatingSeller?: FloatingSellerSettings;
}

// 🧠 Mental Model: Schema.org Person Generator đồng bộ 100% từ cấu hình Admin Portal.
// Ưu tiên đọc tên và thông tin từ contact.sellerName và floatingSeller.sellerName thực tế trong DB.
export const SalerJsonLd = ({ contact, site, floatingSeller }: SalerJsonLdProps) => {
  const siteUrl = site.siteUrl || getSiteUrl();
  const sellerName = contact.sellerName || floatingSeller?.sellerName || contact.salerName || 'Chuyên Viên Tư Vấn Hyundai';
  const rawAvatar = contact.sellerAvatar || floatingSeller?.sellerAvatar || site.defaultImage || '/images/avatar.jpg';
  const fullAvatarUrl = rawAvatar.startsWith('http') ? rawAvatar : `${siteUrl}${rawAvatar}`;
  const sellerPhone = contact.sellerPhone || floatingSeller?.sellerPhone || contact.hotlineKinhDoanh || site.phone;

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${siteUrl}/#saler`,
    name: sellerName,
    jobTitle: 'Chuyên viên Tư vấn Xe Hyundai',
    image: fullAvatarUrl,
    url: siteUrl,
    telephone: sellerPhone,
    email: contact.sellerEmail || contact.email || undefined,
    worksFor: {
      '@type': 'AutoDealer',
      name: contact.showroomName || site.businessName || 'Hyundai Vinh',
      address: {
        '@type': 'PostalAddress',
        streetAddress: contact.diaChi || site.address,
        addressLocality: contact.tinhThanh || 'TP. Vinh',
        addressRegion: contact.tinhThanh || 'Nghệ An',
        addressCountry: 'VN',
      },
    },
    // Khu vực nhận tư vấn và giao xe tận nơi
    areaServed: [
      {
        '@type': 'AdministrativeArea',
        name: 'Nghệ An',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Hà Tĩnh',
      },
    ],
    // Mạng xã hội cá nhân để chứng minh danh tính thực thể E-E-A-T
    sameAs: [
      site.facebookPersonalUrl,
      contact.socialMedia?.facebookUrl,
      floatingSeller?.sellerZalo,
      contact.sellerZalo,
      site.zaloUrl,
      site.tiktokUrl,
    ].filter(Boolean),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
};

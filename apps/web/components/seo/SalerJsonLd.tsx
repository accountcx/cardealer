import type { ContactSettings, SiteSettings } from '@cardealer/types';
import { getSiteUrl } from '@cardealer/env';

export interface SalerJsonLdProps {
  contact: ContactSettings;
  site: SiteSettings;
}

export const SalerJsonLd = ({ contact, site }: SalerJsonLdProps) => {
  const siteUrl = site.siteUrl || getSiteUrl();
  const fullAvatarUrl = (site.defaultImage || '/images/avatar.jpg').startsWith('http')
    ? site.defaultImage
    : `${siteUrl}${site.defaultImage || '/images/avatar.jpg'}`;

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${siteUrl}/#saler`,
    name: contact.salerName || contact.sellerName || 'Nguyễn Văn A', // Tên thật của bạn
    jobTitle: 'Chuyên viên Tư vấn Xe Hyundai',
    image: fullAvatarUrl,
    url: siteUrl,
    telephone: contact.hotlineKinhDoanh,
    email: contact.email,
    worksFor: {
      '@type': 'AutoDealer',
      name: contact.showroomName || 'Hyundai Vinh',
      address: {
        '@type': 'PostalAddress',
        streetAddress: contact.diaChi,
        addressLocality: 'TP. Vinh',
        addressRegion: 'Nghệ An',
        addressCountry: 'VN',
      },
    },
    // Khu vực bạn nhận tư vấn và giao xe tận nơi
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
    // Mạng xã hội cá nhân để chứng minh danh tính thực thể
    sameAs: [
      site.facebookPersonalUrl,
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

import type { ContactSettings, SiteSettings } from '@cardealer/types';

export interface AutoDealerJsonLdProps {
  contact: ContactSettings;
  site: SiteSettings;
}

// 🧠 Mental Model: Script Schema.org 'AutoDealer' tối ưu Google Local Business SEO cho Showroom.
// Tự động chèn metadata địa chỉ, hotline, giờ mở cửa và tọa độ GPS lấy trực tiếp từ cấu hình đại lý.
export const AutoDealerJsonLd = ({ contact, site }: AutoDealerJsonLdProps) => {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: contact.showroomName,
    image: site.defaultImage || '/images/og-image.jpg',
    telephone: contact.hotlineKinhDoanh,
    email: contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: contact.diaChi,
      addressLocality: 'TP. Vinh',
      addressRegion: 'Nghệ An',
      addressCountry: 'VN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: site.mapLatitude || 18.6796,
      longitude: site.mapLongitude || 105.6813,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '08:00',
        closes: '18:00',
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
};

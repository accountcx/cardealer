import type { ContactSettings, SiteSettings } from '@cardealer/types';
import { getSiteUrl } from '@cardealer/env';

export interface AutoDealerJsonLdProps {
  contact: ContactSettings;
  site: SiteSettings;
}

export const AutoDealerJsonLd = ({ contact, site }: AutoDealerJsonLdProps) => {
  const siteUrl = site.siteUrl || getSiteUrl();
  const fullImageUrl = (site.defaultImage || '/images/og-image.jpg').startsWith('http')
    ? site.defaultImage
    : `${siteUrl}${site.defaultImage || '/images/og-image.jpg'}`;

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    '@id': `${siteUrl}/#dealer`,
    name: contact.showroomName,
    url: siteUrl,
    image: fullImageUrl,
    telephone: contact.hotlineKinhDoanh,
    email: contact.email,
    priceRange: '$$$$',
    currenciesAccepted: 'VND',
    paymentAccepted: 'Tiền mặt, Chuyển khoản ngân hàng, Trả góp qua ngân hàng',
    hasMap: site.googleMapEmbedUrl || undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: contact.diaChi,
      addressLocality: contact.tinhThanh || 'TP. Vinh',
      addressRegion: contact.tinhThanh || 'Nghệ An',
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
    sameAs: [
      site.facebookUrl,
      site.youtubeUrl,
      site.zaloUrl,
    ].filter(Boolean),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
};

export { SalerJsonLd } from './SalerJsonLd';
export type { SalerJsonLdProps } from './SalerJsonLd';


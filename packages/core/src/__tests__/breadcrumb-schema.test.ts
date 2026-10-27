import { describe, it, expect } from 'vitest';

describe('Breadcrumb Schema URLs', () => {
  it('tạo 100% Absolute URL cho mọi vị trí trong BreadcrumbList', () => {
    const siteUrl = 'https://xehyundaivinh.com';
    const pathname = '/xe';

    const items = [
      { label: 'Trang chủ', href: '/' },
      { label: 'Bảng giá dòng xe' },
    ];

    const currentFullUrl = `${siteUrl}${pathname}`;
    const itemListElement = items.map((item, index) => {
      const isLast = index === items.length - 1;
      let absoluteItemUrl: string;

      if (item.href) {
        if (item.href.startsWith('http://') || item.href.startsWith('https://')) {
          absoluteItemUrl = item.href;
        } else if (item.href === '/' || item.href === '') {
          absoluteItemUrl = `${siteUrl}/`;
        } else {
          const cleanHref = item.href.startsWith('/') ? item.href : `/${item.href}`;
          absoluteItemUrl = `${siteUrl}${cleanHref}`;
        }
      } else if (isLast) {
        absoluteItemUrl = currentFullUrl;
      } else {
        absoluteItemUrl = `${siteUrl}/`;
      }

      return {
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
        item: absoluteItemUrl,
      };
    });

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': `${currentFullUrl}#breadcrumb`,
      itemListElement,
    };

    // Position 1: Trang chủ phải là URL tuyệt đối có trailing slash https://xehyundaivinh.com/
    expect(schema.itemListElement[0].position).toBe(1);
    expect(schema.itemListElement[0].name).toBe('Trang chủ');
    expect(schema.itemListElement[0].item).toBe('https://xehyundaivinh.com/');
    expect(schema.itemListElement[0].item).not.toBe('/');

    // Position 2: Mục hiện tại không có href được gán tường minh URL trang hiện tại
    expect(schema.itemListElement[1].position).toBe(2);
    expect(schema.itemListElement[1].name).toBe('Bảng giá dòng xe');
    expect(schema.itemListElement[1].item).toBe('https://xehyundaivinh.com/xe');

    // BreadcrumbList có @id định danh
    expect(schema['@id']).toBe('https://xehyundaivinh.com/xe#breadcrumb');
  });

  it('xử lý đúng đường dẫn phân cấp sâu 3 tầng (/dong-xe/suv)', () => {
    const siteUrl = 'https://xehyundaivinh.com';
    const pathname = '/dong-xe/suv';

    const items = [
      { label: 'Trang chủ', href: '/' },
      { label: 'Dòng xe', href: '/xe' },
      { label: 'SUV' },
    ];

    const currentFullUrl = `${siteUrl}${pathname}`;
    const itemListElement = items.map((item, index) => {
      const isLast = index === items.length - 1;
      let absoluteItemUrl: string;

      if (item.href) {
        if (item.href.startsWith('http://') || item.href.startsWith('https://')) {
          absoluteItemUrl = item.href;
        } else if (item.href === '/' || item.href === '') {
          absoluteItemUrl = `${siteUrl}/`;
        } else {
          const cleanHref = item.href.startsWith('/') ? item.href : `/${item.href}`;
          absoluteItemUrl = `${siteUrl}${cleanHref}`;
        }
      } else if (isLast) {
        absoluteItemUrl = currentFullUrl;
      } else {
        absoluteItemUrl = `${siteUrl}/`;
      }

      return {
        '@type': 'ListItem',
        position: index + 1,
        name: item.label,
        item: absoluteItemUrl,
      };
    });

    expect(itemListElement[0].item).toBe('https://xehyundaivinh.com/');
    expect(itemListElement[1].item).toBe('https://xehyundaivinh.com/xe');
    expect(itemListElement[2].item).toBe('https://xehyundaivinh.com/dong-xe/suv');
  });
});

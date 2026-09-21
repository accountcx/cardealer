'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import type { NavLink } from '@cardealer/types';
import { useNavigationLinks } from '../../context/NavigationContext';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  headerLinks?: NavLink[];
  separator?: 'chevron' | 'slash' | React.ReactNode;
  className?: string;
}

// 🧠 Mental Model: Dynamic Breadcrumb Component tự động sinh theo URL và danh mục Menu API từ CMS.
// 1. Không hardcode ROUTE_LABELS: Tự động trích xuất tên hiển thị tương ứng từ settings.navigation.headerLinks (CMS API).
// 2. Định dạng thuần túy (Clean Typographic): Không viền, không nền pill, căn lề trái tự nhiên thẳng hàng với Form bên dưới.
// 3. Phân cấp thị giác: Trang cha làm mờ (text-white/70), trang hiện tại làm đậm (text-white font-semibold).
// 4. Ký tự phân cách: Hỗ trợ linh hoạt giữa ChevronRight nhỏ tinh tế hoặc dấu gạch chéo '/'.
// 5. Tích hợp JSON-LD BreadcrumbList Schema chuẩn SEO Google.
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  headerLinks: propHeaderLinks,
  separator = 'chevron',
  className = '',
}) => {
  const pathname = usePathname();
  const contextLinks = useNavigationLinks();
  const links = propHeaderLinks || contextLinks || [];

  // Tự động sinh breadcrumb từ URL và dữ liệu Menu từ CMS API
  const breadcrumbItems: BreadcrumbItem[] = React.useMemo(() => {
    if (items && items.length > 0) return items;

    // Xây dựng bản đồ URL -> Tên hiển thị từ API Menu CMS
    const labelMap = new Map<string, string>();
    labelMap.set('/', 'Trang chủ');
    labelMap.set('', 'Trang chủ');

    links.forEach((link) => {
      const cleanUrl = link.url.replace(/^\/+|\/+$/g, '');
      if (cleanUrl) {
        labelMap.set(cleanUrl, link.label);
        labelMap.set(`/${cleanUrl}`, link.label);
      }

      link.subLinks?.forEach((sub) => {
        const cleanSubUrl = sub.url.replace(/^\/+|\/+$/g, '');
        if (cleanSubUrl) {
          labelMap.set(cleanSubUrl, sub.label);
          labelMap.set(`/${cleanSubUrl}`, sub.label);
        }
      });
    });

    const segments = pathname.split('/').filter(Boolean);
    const generated: BreadcrumbItem[] = [{ label: 'Trang chủ', href: '/' }];

    let currentPath = '';
    segments.forEach((seg, idx) => {
      currentPath += `/${seg}`;
      const isLast = idx === segments.length - 1;

      // Ưu tiên:
      // 1. Khớp từ Menu API CMS
      // 2. Chuyển đổi slug đẹp mắt (kebab-case -> Title Case)
      const label =
        labelMap.get(seg) ||
        labelMap.get(currentPath) ||
        seg
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

      generated.push({
        label,
        href: isLast ? undefined : currentPath,
      });
    });

    return generated;
  }, [items, pathname, links]);

  // Schema JSON-LD BreadcrumbList cho Google Search
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: item.href } : {}),
    })),
  };

  // Render ký tự phân cách theo tùy chọn
  const renderSeparator = () => {
    if (separator === 'slash') {
      return <span className="text-white/40 mx-0.5 select-none">/</span>;
    }
    if (separator === 'chevron') {
      return <ChevronRight className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />;
    }
    return separator;
  };

  return (
    <>
      {/* SEO Schema BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Navigation thuần túy: Không viền, không nền, căn trái */}
      <nav
        aria-label="Breadcrumb"
        className={`flex items-center flex-wrap gap-1.5 text-xs text-white/70 mb-3 ${className}`}
      >
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return (
            <React.Fragment key={`${item.label}-${index}`}>
              {index > 0 && renderSeparator()}

              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-white transition-colors duration-150"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className="text-white font-semibold"
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </nav>
    </>
  );
};

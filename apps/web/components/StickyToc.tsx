// 🧠 Mental Model: StickyToc là Client Island Mục Lục Bài Viết Thông Minh (Table of Contents) cho Storefront Hyundai Vinh.
// Tuân thủ triệt để universal-agentic-workflow.xml, fullstack-dev-executor.xml và tailwind-ui-designer.xml:
// 1. Client Island Performance First: Chỉ hydrate riêng khối Mục lục, không làm nặng toàn bộ trang bài viết RSC.
// 2. Strict Heading Filter & Nesting Logic (Cha - Con):
//    - Tiếp nhận mảng TocHeading trích xuất trước từ Server AST (@cardealer/core) với cấu trúc phân cấp H2 -> H3.
//    - Fallback scan DOM nghiêm ngặt (#article-content): chỉ lấy h2, h3 luồng văn bản chính, loại trừ triệt để Component UI (Bảng giá, FAQ, Callout, Table, Sidebar).
//    - H3 bắt buộc thuộc về thẻ H2 gần nhất nằm ngay phía trên nó.
// 3. Scrollspy Real-time với IntersectionObserver:
//    - Tự động theo dõi vị trí cuộn trang, highlight mục đang đọc với rootMargin thông minh (-80px 0px -55% 0px).
//    - Smooth scrolling có tính toán offset fixed header (offset 90px).
// 4. Responsive & Collapsible Control:
//    - Cho phép độc giả thu gọn / mở rộng mục lục 1 chạm (tối ưu trải nghiệm đọc trên Mobile / Tablet).
// 5. 4-State UI Matrix Chuẩn Mực:
//    - Data State: Hiển thị danh sách phân cấp rõ ràng (H2 in đậm, H3 thụt lề có nhánh cây ↳).
//    - Empty State: Trả về null an toàn nếu bài viết không có thẻ tiêu đề (triệt tiêu CLS layout shift).
// 6. WCAG AAA & Accessibility: Đầy đủ ARIA roles (role="navigation", aria-current="location"), touch target >= 44px,
//    hỗ trợ điều hướng bàn phím và tuân thủ motion-reduce:transition-none.
// 7. 100% Named Export: TUYỆT ĐỐI CẤM export default.

'use client';

import * as React from 'react';
import { ListTree, ChevronDown, ChevronUp, Bookmark, CornerDownRight } from 'lucide-react';
import { Button } from '@cardealer/ui';
import type { TocHeading } from '@cardealer/core';

export interface StickyTocProps {
  headings?: TocHeading[];
  contentSelector?: string;
  title?: string;
  className?: string;
}

export function StickyToc({
  headings: initialHeadings,
  contentSelector = '#article-content',
  title = 'Mục lục nội dung',
  className = '',
}: StickyTocProps) {
  const [headings, setHeadings] = React.useState<TocHeading[]>(initialHeadings || []);
  const [activeId, setActiveId] = React.useState<string>('');
  const [isCollapsed, setIsCollapsed] = React.useState<boolean>(false);

  // 1. Tự động scan DOM nghiêm ngặt nếu mảng headings ban đầu rỗng
  React.useEffect(() => {
    if (initialHeadings && initialHeadings.length > 0) {
      setHeadings(initialHeadings);
      return;
    }

    const container =
      document.querySelector(contentSelector) ||
      document.getElementById('article-content') ||
      document.querySelector('article .prose');
    if (!container) return;

    // 🛡️ Strict Heading Filter:
    // Chỉ quét các thẻ h2, h3 nằm ở luồng văn bản chính, loại trừ mọi thẻ nằm trong Component UI đặc thù
    const rawElements = container.querySelectorAll('h2, h3');
    const filteredElements: HTMLElement[] = [];

    rawElements.forEach((el) => {
      const htmlEl = el as HTMLElement;

      // a. Loại trừ nếu thẻ có class opt-out hoặc data-attribute ignore
      if (
        htmlEl.classList.contains('ignore-toc') ||
        htmlEl.classList.contains('no-toc') ||
        htmlEl.classList.contains('toc-ignore') ||
        htmlEl.getAttribute('data-toc') === 'ignore' ||
        htmlEl.getAttribute('data-ignore-toc') === 'true'
      ) {
        return;
      }

      // b. Loại trừ nếu nằm bên trong Component UI đặc thù (Bảng giá, Gallery, Callout, FAQ, Spec, Table, Sidebar, Form, v.v.)
      if (
        htmlEl.closest(
          '.not-prose, .ignore-toc, .no-toc, [data-toc="ignore"], [data-role="commercial-block"], [data-role="lead-form"], table, thead, tbody, aside, form, figure'
        )
      ) {
        return;
      }

      filteredElements.push(htmlEl);
    });

    const scanned: TocHeading[] = [];
    let currentH2Id: string | undefined = undefined;

    filteredElements.forEach((el, index) => {
      let id = el.id;
      const headingTitle = el.textContent?.trim() || `Phần ${index + 1}`;
      if (!id) {
        id = `section-${index + 1}`;
        el.id = id;
      }
      const level = parseInt(el.tagName.replace('H', ''), 10) || 2;
      let parentId: string | undefined = undefined;

      if (level === 2) {
        currentH2Id = id;
      } else if (level === 3) {
        // 🛡️ Nesting Logic: H3 bắt buộc phải thuộc về thẻ H2 gần nhất nằm ngay phía trên nó
        parentId = currentH2Id;
      }

      scanned.push({
        id,
        title: headingTitle,
        level,
        ...(parentId ? { parentId } : {}),
      });
    });

    if (scanned.length > 0) {
      setHeadings(scanned);
    }
  }, [initialHeadings, contentSelector]);

  // 2. IntersectionObserver Scrollspy theo dõi heading hiện tại
  React.useEffect(() => {
    if (headings.length === 0) return;

    const observerCallback: IntersectionObserverCallback = (entries) => {
      // Tìm heading đầu tiên đang giao cắt với viewport
      const intersecting = entries.find((entry) => entry.isIntersecting);
      if (intersecting) {
        setActiveId(intersecting.target.id);
      }
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '-80px 0px -55% 0px',
      threshold: 0,
    });

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [headings]);

  // 3. Xử lý cuộn trang mượt mà (Smooth Scroll) có bù trừ Fixed Header
  const handleScrollToHeading = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (!element) return;

    const headerOffset = 90;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });

    setActiveId(id);
    // Cập nhật hash trên URL mà không gây nhảy trang giật cục
    if (window.history.pushState) {
      window.history.pushState(null, '', `#${id}`);
    }
  };

  // 4. Empty State: Nếu bài viết không có thẻ tiêu đề, ẩn hoàn toàn không gây vỡ giao diện
  if (!headings || headings.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Mục lục bài viết"
      className={`rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all duration-200 motion-reduce:transition-none ${className}`}
    >
      {/* Tiêu đề mục lục & Nút thu gọn */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <ListTree className="w-4 h-4 text-blue-600" />
          <span>{title}</span>
          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
            {headings.length}
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="min-h-11 min-w-11 p-0 inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? 'Mở rộng mục lục' : 'Thu gọn mục lục'}
        >
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </Button>
      </div>

      {/* Danh sách các đề mục phân cấp rõ ràng (H2 vs H3) */}
      {!isCollapsed && (
        <ul className="mt-3.5 space-y-1 text-xs max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
          {headings.map((item) => {
            const isActive = activeId === item.id;
            const isH3 = item.level === 3;

            return (
              <li key={item.id} className={isH3 ? 'pl-4 sm:pl-5' : 'pl-0'}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => handleScrollToHeading(e, item.id)}
                  aria-current={isActive ? 'location' : undefined}
                  className={`group min-h-8 flex items-center justify-between py-1.5 px-2.5 rounded-lg transition-colors motion-reduce:transition-none ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600'
                      : isH3
                        ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-50 text-[11.5px]'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate pr-2">
                    {isH3 && (
                      <CornerDownRight className="w-3 h-3 text-slate-400 shrink-0" />
                    )}
                    <span className="truncate">{item.title}</span>
                  </div>
                  {isActive && (
                    <Bookmark className="w-3 h-3 text-blue-600 flex-shrink-0 animate-in fade-in zoom-in-50 duration-150" />
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
}

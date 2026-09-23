'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronDown, ListFilter } from 'lucide-react';
import { Button } from '@cardealer/ui';

interface CarReviewWithTOCProps {
  carName: string;
  generalDescription?: string | null;
  reviewContent?: any;
}

interface TOCItem {
  id: string;
  title: string;
}

const DEFAULT_TOC_ITEMS: TOCItem[] = [
  { id: 'tong-quan', title: '1. Tổng quan & Vị thế' },
  { id: 'ngoai-that', title: '2. Thiết kế Ngoại thất' },
  { id: 'noi-that', title: '3. Không gian Nội thất & Tiện nghi' },
  { id: 'van-hanh', title: '4. Khả năng Vận hành' },
  { id: 'an-toan', title: '5. Công nghệ An toàn chủ động' },
];

/**
 * 🧠 Mental Model: Bài viết đánh giá chuyên sâu kèm Mục lục thông minh (CarReviewWithTOC).
 * - Cung cấp nội dung đánh giá giàu tính chuyên môn từ góc nhìn Saler ô tô kỳ cựu.
 * - Sticky Table of Contents (TOC) trên Desktop bám theo khi người dùng cuộn trang.
 * - Scrollspy sử dụng IntersectionObserver tự động đánh dấu mục đang xem.
 * - Accordion mục lục trên Mobile giúp tiết kiệm diện tích và định hướng đọc tiện lợi.
 */
export function CarReviewWithTOC({
  carName,
  generalDescription,
  reviewContent,
}: CarReviewWithTOCProps) {
  const [activeId, setActiveId] = useState<string>('tong-quan');
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);

  // Scrollspy bằng IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0.1,
      }
    );

    DEFAULT_TOC_ITEMS.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const topOffset = element.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
      setActiveId(id);
      setIsMobileTocOpen(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Đánh Giá Chi Tiết Dòng Xe {carName}
          </h2>
          <p className="text-xs text-slate-500">
            Góc nhìn thực tế từ chuyên viên tư vấn bán hàng kinh nghiệm
          </p>
        </div>
      </div>

      {/* 📱 Mobile TOC Accordion */}
      <div className="lg:hidden">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setIsMobileTocOpen(!isMobileTocOpen)}
          className="w-full h-auto flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 hover:bg-slate-100"
        >
          <span className="flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-blue-600" />
            Mục lục bài đánh giá
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isMobileTocOpen ? 'rotate-180' : ''
            }`}
          />
        </Button>

        {isMobileTocOpen && (
          <div className="mt-2 p-2 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            {DEFAULT_TOC_ITEMS.map((item) => (
              <Button
                key={item.id}
                type="button"
                variant={activeId === item.id ? 'accent' : 'ghost'}
                size="sm"
                onClick={() => scrollToSection(item.id)}
                className={`w-full justify-start text-left whitespace-normal h-auto px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  activeId === item.id
                    ? 'bg-blue-600 text-white shadow-2xs font-bold'
                    : 'text-slate-700 hover:bg-slate-200/60'
                }`}
              >
                {item.title}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Main Grid: Nội dung và Sticky TOC trên Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Cột Trái: Nội dung chi tiết các phần */}
        <div className="lg:col-span-8 space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
          {/* Section 1: Tổng quan */}
          <section id="tong-quan" className="space-y-3 scroll-mt-24">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
              1. Tổng quan & Vị thế dòng xe
            </h3>
            <p>
              {generalDescription ||
                `Dòng xe ${carName} khẳng định vị thế dẫn đầu trong phân khúc nhờ sự kết hợp hoàn hảo giữa ngôn ngữ thiết kế thời thượng, công nghệ an toàn chủ động hàng đầu và không gian nội thất sang trọng tiện nghi. Đây là sự lựa chọn ưu tiên của các gia đình hiện đại cũng như các khách hàng doanh nhân tìm kiếm một mẫu xe đa dụng, phong cách và kinh tế.`}
            </p>
          </section>

          {/* Section 2: Ngoại thất */}
          <section id="ngoai-that" className="space-y-3 scroll-mt-24">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
              2. Thiết kế Ngoại thất ấn tượng
            </h3>
            <p>
              {carName} sở hữu diện mạo nổi bật với cụm lưới tản nhiệt dạng tham số đặc trưng,
              hệ thống đèn LED ban ngày ẩn tích hợp tinh tế và đường dập nổi gân guốc chạy dọc thân
              xe. La-zăng hợp kim phay xước kích thước lớn cùng đuôi xe thể thao tạo nên dáng vẻ vững
              chãi, cuốn hút từ mọi góc nhìn trên đường phố.
            </p>
          </section>

          {/* Section 3: Nội thất */}
          <section id="noi-that" className="space-y-3 scroll-mt-24">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
              3. Không gian Nội thất & Tiện nghi cao cấp
            </h3>
            <p>
              Bước vào khoang lái, quý khách sẽ cảm nhận ngay triết lý thiết kế tối giản nhưng giàu cảm
              xúc. Màn hình cảm ứng giải trí kích thước lớn hỗ trợ kết nối Apple CarPlay/Android Auto
              không dây, hệ thống âm thanh vòm sống động, ghế ngồi bọc da cao cấp chỉnh điện đa hướng
              kèm chức năng sưởi/làm mát mang lại sự thoải mái tuyệt đối trên những hành trình dài.
            </p>
          </section>

          {/* Section 4: Vận hành */}
          <section id="van-hanh" className="space-y-3 scroll-mt-24">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
              4. Khả năng Vận hành & Tiết kiệm nhiên liệu
            </h3>
            <p>
              Được trang bị khối động cơ thế hệ mới tối ưu công suất và mô-men xoắn, {carName} mang lại
              cảm giác lái nhạy bén, tăng tốc mượt mà nhưng vẫn duy trì mức tiêu hao nhiên liệu vô cùng
              ấn tượng. Hệ thống treo êm ái cùng khả năng cách âm vượt trội giúp mọi chuyến đi êm đềm
              và tĩnh lặng.
            </p>
          </section>

          {/* Section 5: An toàn */}
          <section id="an-toan" className="space-y-3 scroll-mt-24">
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 border-l-4 border-blue-600 pl-3">
              5. Hệ thống An toàn chủ động hàng đầu
            </h3>
            <p>
              An tâm tối đa là ưu tiên cốt lõi. Xe được trang bị gói công nghệ an toàn chủ động với các
              tính năng hiện đại như: Hỗ trợ phòng tránh va chạm phía trước, Cảnh báo điểm mù, Giữ làn
              đường tự động, Kiểm soát hành trình thích ứng Smart Cruise Control và hệ thống túi khí
              bảo vệ toàn diện cho mọi hành khách.
            </p>
          </section>
        </div>

        {/* 🖥️ Cột Phải: Sticky Table of Contents (TOC) trên Desktop */}
        <div className="hidden lg:block lg:col-span-4 sticky top-24 space-y-3">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
              <ListFilter className="w-3.5 h-3.5 text-blue-600" />
              Mục lục nội dung
            </p>
            <nav className="space-y-1">
              {DEFAULT_TOC_ITEMS.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <Button
                    key={item.id}
                    type="button"
                    variant={isActive ? 'accent' : 'ghost'}
                    size="sm"
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full justify-start text-left whitespace-normal h-auto text-xs font-semibold px-3 py-2 rounded-xl transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    {item.title}
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}

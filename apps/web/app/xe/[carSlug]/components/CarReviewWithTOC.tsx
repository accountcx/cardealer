'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, ChevronDown, ListFilter, Calendar, Clock, User } from 'lucide-react';
import type { CarArticle } from '@cardealer/types';
import { extractHeadingsFromTiptap, convertTiptapToHtml, type TocHeading } from '@cardealer/core';

interface CarReviewWithTOCProps {
  carName: string;
  generalDescription?: string | null;
  reviewContent?: any;
  article?: CarArticle | null;
  consultantHotline?: string;
  consultantZalo?: string;
}

/**
 * 🧠 Mental Model: Bài viết đánh giá chuyên sâu dòng xe kèm Mục lục thông minh (CarReviewWithTOC).
 * - Tự động trích xuất Headings từ Tiptap JSON AST AST của car.article làm Sticky Table of Contents (TOC).
 * - Scrollspy sử dụng IntersectionObserver tự động đánh dấu mục đang xem.
 * - Accordion mục lục trên Mobile giúp định hướng đọc mượt mà và tiện lợi.
 * - Render Semantic HTML chuẩn SEO: Headings, Callouts, Images, SpecTables, ProsCons, CTAs...
 * - Tự động ẩn sạch sẽ nếu dòng xe chưa có bài viết xuất bản, không render boilerplate rác.
 */
export function CarReviewWithTOC({
  carName,
  generalDescription,
  reviewContent,
  article,
  consultantHotline,
  consultantZalo,
}: CarReviewWithTOCProps) {
  // Chỉ hiển thị khi có article đã xuất bản
  const hasPublishedArticle = Boolean(article && article.status === 'published');

  // Trích xuất Headings cho TOC động
  const tocHeadings: TocHeading[] = useMemo(() => {
    if (!hasPublishedArticle || !article?.noiDung) return [];
    return extractHeadingsFromTiptap(article.noiDung);
  }, [hasPublishedArticle, article?.noiDung]);

  // Chuyển đổi Tiptap AST sang HTML
  const articleHtml: string = useMemo(() => {
    if (!hasPublishedArticle || !article?.noiDung) return '';
    return convertTiptapToHtml(article.noiDung, {
      hotline: consultantHotline,
      zalo: consultantZalo,
    });
  }, [hasPublishedArticle, article?.noiDung, consultantHotline, consultantZalo]);

  const [activeId, setActiveId] = useState<string>('');
  const [isTocOpen, setIsTocOpen] = useState(false);

  // Set default activeId
  useEffect(() => {
    if (tocHeadings.length > 0 && !activeId) {
      setActiveId(tocHeadings[0].id);
    }
  }, [tocHeadings, activeId]);

  // Scrollspy bằng IntersectionObserver
  useEffect(() => {
    if (tocHeadings.length === 0) return;

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

    tocHeadings.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [tocHeadings]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const topOffset = element.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
      setActiveId(id);
    }
  };

  // Nếu không có bài viết đánh giá đã xuất bản, trả về null để tránh trùng lặp nội dung rác
  if (!hasPublishedArticle || !article) {
    return null;
  }

  const publishedDate = article.publishedAt || article.createdAt;
  const formattedDate = publishedDate
    ? new Date(publishedDate).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : null;

  return (
    <article
      id="danh-gia-chi-tiet"
      className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 space-y-6 shadow-sm scroll-mt-24"
    >
      {/* Header bài viết */}
      <div className="space-y-3 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span>Đánh Giá Chuyên Sâu</span>
        </div>

        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-snug">
          {article.tieuDe || `Đánh Giá Chi Tiết Dòng Xe ${carName}`}
        </h2>

        {/* Metadata info: Tác giả, Ngày đăng, Thời gian đọc */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
          {article.author?.fullName && (
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              <User size={14} className="text-blue-600" />
              <span>{article.author.fullName}</span>
            </div>
          )}

          {formattedDate && (
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-slate-400" />
              <span>{formattedDate}</span>
            </div>
          )}

          {article.readingTime && (
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-slate-400" />
              <span>{article.readingTime} phút đọc</span>
            </div>
          )}

          {article.wordCount && (
            <span className="hidden sm:inline text-slate-400">
              • {article.wordCount} từ
            </span>
          )}
        </div>

        {/* Sapo / Đoạn văn tóm tắt */}
        {article.tomTat && (
          <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/60 border border-blue-100 text-slate-800 text-sm sm:text-base font-medium leading-relaxed mt-4">
            {article.tomTat}
          </div>
        )}
      </div>

      {/* 📌 Mục lục đưa lên đầu, mặc định đóng (collapsible) để tối ưu không gian */}
      {tocHeadings.length > 0 && (
        <div className="rounded-2xl border border-slate-200/90 bg-slate-50/80 p-3.5 sm:p-4 transition-all">
          <button
            type="button"
            onClick={() => setIsTocOpen(!isTocOpen)}
            className="w-full flex items-center justify-between text-left group focus:outline-none cursor-pointer"
            aria-expanded={isTocOpen}
          >
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-100/80 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <ListFilter className="w-4 h-4" />
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                Mục lục bài đánh giá
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-600">
                {tocHeadings.length} mục
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 group-hover:text-blue-600 transition-colors">
              <span>{isTocOpen ? 'Thu gọn' : 'Xem mục lục'}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isTocOpen ? 'rotate-180 text-blue-600' : ''
                }`}
              />
            </div>
          </button>

          {isTocOpen && (
            <nav className="mt-3.5 pt-3.5 border-t border-slate-200/70 grid grid-cols-1 sm:grid-cols-2 gap-1.5 animate-in fade-in-50 duration-200">
              {tocHeadings.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToSection(item.id)}
                    className={`text-left text-xs font-medium px-3 py-2 rounded-xl transition-all cursor-pointer ${
                      item.level === 3 ? 'pl-6 text-[11px]' : ''
                    } ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-700 hover:text-blue-600 hover:bg-slate-200/60'
                    }`}
                  >
                    {item.title}
                  </button>
                );
              })}
            </nav>
          )}
        </div>
      )}

      {/* 📖 Nội dung bài viết chiếm trọn 100% độ rộng (Full Width) */}
      <div className="w-full text-slate-700 leading-relaxed text-sm sm:text-base">
        <div
          className="prose prose-slate max-w-none prose-headings:scroll-mt-24 prose-img:rounded-2xl"
          dangerouslySetInnerHTML={{ __html: articleHtml }}
        />
      </div>
    </article>
  );
}

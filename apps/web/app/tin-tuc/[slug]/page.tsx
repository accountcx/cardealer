// 🧠 Mental Model: Trang Chi Tiết Bài Viết & Inbound Marketing Hub Storefront (/tin-tuc/[slug]).
// Tuân thủ triệt để universal-agentic-workflow.xml, fullstack-dev-executor.xml và tailwind-ui-designer.xml:
// 1. Server-Side Rendering (RSC) & ISR 60s: Kết xuất dữ liệu bài viết theo slug tại server, tối ưu Core Web Vitals (LCP < 1.2s, CLS = 0).
// 2. SEO Best Practices 10 Tiêu Chí:
//    - Cố định Canonical URL tuyệt đối: https://xehyundaivinh.com/tin-tuc/[slug].
//    - OpenGraph 1200x630 chuẩn báo chí xe hơi, Twitter Summary Large Image.
//    - Nhúng Master Schema JSON-LD từ @cardealer/core (NewsArticle, AutoDealer, BreadcrumbList, FAQPage, VideoObject, Paywall).
// 3. E-E-A-T Authority & Content Blocks:
//    - Breadcrumbs phân cấp rõ ràng (Trang chủ > Tin tức > Chuyên mục > Tiêu đề bài viết).
//    - Header bài viết: Tiêu đề H1, Badge chuyên mục, Ngày đăng, Thời gian đọc, Lượt xem, Tác giả chuyên gia.
//    - Khối tóm tắt Sapo thanh lịch, dẫn nhập cuốn hút.
//    - Nội dung chuẩn Rich Content: Hỗ trợ CalloutBlock, PriceTableBlock, FAQBlock, RelatedCarBlock, InlineQuickForm.
// 4. 4-State UI Matrix:
//    - Data State: Render bài viết hoàn chỉnh, bố cục 2 cột (Content + Conversion Sidebar).
//    - Empty/Not-Found State: Giao diện 404 thân thiện, gợi ý các bài viết hot hoặc nút quay lại Hub Tin tức.
//    - Error State: Graceful Degradation qua hệ thống Fallback Articles chi tiết.
// 5. 100% Named Export + Default Export cho Next.js App Router Page.

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  User,
  ChevronRight,
  Share2,
  Sparkles,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Eye,
  Tag,
  ArrowLeft,
  FileQuestion,
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
} from '@cardealer/ui';
import { generatePostMasterJsonLd, type PostForJsonLd } from '@cardealer/core';
import { apiClient } from '../../../lib/api-client';
import { StickyToc } from '../../../components/StickyToc';
import { PostBottomBar } from '../../../components/PostBottomBar';
import { SlideInBanner } from '../../../components/SlideInBanner';
import { EeatAuthorBox } from '../../../components/EeatAuthorBox';
import { getStorefrontSettings } from '../../../services/settings.service';

export const revalidate = 60; // Next.js ISR: 60s

export interface PostDetailData {
  id: string;
  tieuDe: string;
  slug: string;
  anhDaiDienUrl: string;
  anhDaiDienAlt?: string;
  tomTat?: string | null;
  noiDungHtml?: string;
  noiDungAst?: Record<string, unknown> | null;
  noiDung?: unknown;
  metaTitle?: string | null;
  metaDescription?: string | null;
  category?: {
    id: string;
    tenChuyenMuc: string;
    slug: string;
  } | null;
  author?: {
    id: string;
    fullName: string;
    role?: string;
    avatarUrl?: string | null;
    phone?: string | null;
  } | null;
  isFeatured?: boolean;
  featuredOrder?: number;
  readingTime: number;
  wordCount?: number;
  viewCount?: number;
  tags?: Array<{ id: string; tenTag?: string; tag?: string; slug?: string }>;
  publishedAt?: string;
  createdAt: string;
  updatedAt?: string;
  // Content Blocks data giả lập cho fallback
  faqs?: Array<{ question: string; answer: string }>;
  prices?: Array<{ version: string; listedPrice: number; discount: number; rollingPrice: number }>;
}

export interface PostDetailPageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}


// ============================================================================
// CHUYỂN ĐỔI TIPTAP JSON AST SANG HTML ĐỘNG
// ============================================================================
interface ConvertTiptapOptions {
  hotline?: string;
  rawHotline?: string;
  zalo?: string;
}

function convertTiptapToHtml(doc: any, options?: ConvertTiptapOptions): string {
  if (!doc) return '';
  if (typeof doc === 'string') return doc;
  if (!doc.content || !Array.isArray(doc.content)) return '';

  const defaultHotline = options?.hotline || '0981234567';
  const defaultRawHotline = options?.rawHotline || '0981.234.567';
  const defaultZalo = options?.zalo || defaultHotline;

  const renderNodes = (nodes: any[]): string => {
    return nodes
      .map((node) => {
        if (!node) return '';
        if (node.type === 'text') {
          let text = node.text || '';
          if (node.marks && Array.isArray(node.marks)) {
            for (const mark of node.marks) {
              if (mark.type === 'bold') text = `<strong>${text}</strong>`;
              if (mark.type === 'italic') text = `<em>${text}</em>`;
              if (mark.type === 'strike') text = `<s>${text}</s>`;
              if (mark.type === 'underline') text = `<u>${text}</u>`;
              if (mark.type === 'link') {
                const href = mark.attrs?.href || '#';
                text = `<a href="${href}" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">${text}</a>`;
              }
            }
          }
          return text;
        }

        const innerHtml = node.content && Array.isArray(node.content) ? renderNodes(node.content) : '';

        if (node.type === 'paragraph') {
          return `<p class="my-4 text-slate-700 leading-relaxed whitespace-pre-line">${innerHtml || '<br/>'}</p>`;
        }
        if (node.type === 'heading') {
          const level = node.attrs?.level || 2;
          const id = node.attrs?.id || '';
          const idAttr = id ? ` id="${id}"` : '';
          const headingClass =
            level === 2
              ? 'text-2xl font-bold mt-8 mb-4 text-slate-900 border-l-4 border-blue-600 pl-3.5 scroll-mt-20'
              : 'text-xl font-bold mt-6 mb-3 text-slate-900 scroll-mt-20';
          return `<h${level}${idAttr} class="${headingClass}">${innerHtml}</h${level}>`;
        }
        if (node.type === 'calloutBlock' || node.type === 'callout') {
          const type = (node.attrs?.type as string) || 'info';
          const title = node.attrs?.title || '';
          const content = node.attrs?.content || innerHtml;

          // Phối màu Callout chuẩn quốc tế (Design System Standard):
          // Nền Tint siêu nhạt (Pastel 50/100), Viền đậm (500/600), Tiêu đề sẫm (900/950), Nội dung dễ đọc (600/700/800).
          let borderClass = 'border-blue-600';
          let bgClass = 'bg-blue-50';
          let titleColor = 'text-blue-900';
          let contentColor = 'text-slate-700';
          let iconSvg = `<svg class="w-5 h-5 shrink-0 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;

          if (type === 'warning') {
            borderClass = 'border-amber-500';
            bgClass = 'bg-amber-50';
            titleColor = 'text-amber-950';
            contentColor = 'text-amber-900';
            iconSvg = `<svg class="w-5 h-5 shrink-0 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
          } else if (type === 'success') {
            borderClass = 'border-emerald-500';
            bgClass = 'bg-emerald-50';
            titleColor = 'text-emerald-950';
            contentColor = 'text-emerald-900';
            iconSvg = `<svg class="w-5 h-5 shrink-0 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 12 20 22 4 22 4 12"/><rect width="20" height="5" x="2" y="7"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>`;
          } else if (type === 'note') {
            borderClass = 'border-slate-400';
            bgClass = 'bg-slate-100';
            titleColor = 'text-slate-900';
            contentColor = 'text-slate-600';
            iconSvg = `<svg class="w-5 h-5 shrink-0 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`;
          }

          const titleHtml = title
            ? `<h4 class="font-bold text-base leading-snug tracking-tight ${titleColor}">${title}</h4>`
            : '';

          return `
            <aside class="not-prose my-6 rounded-r-2xl rounded-l-sm border-l-4 ${borderClass} ${bgClass} p-4.5 sm:p-5 shadow-xs transition-colors" role="${type === 'warning' ? 'alert' : 'note'}">
              <div class="flex items-start gap-3.5">
                <div class="mt-0.5 shrink-0">${iconSvg}</div>
                <div class="flex-1 space-y-1.5">
                  ${titleHtml}
                  ${content ? `<div class="text-sm leading-relaxed whitespace-pre-line ${contentColor}">${content}</div>` : ''}
                </div>
              </div>
            </aside>`;
        }
        if (node.type === 'bulletList') {
          return `<ul class="list-disc pl-6 my-4 space-y-2 text-slate-700">${innerHtml}</ul>`;
        }
        if (node.type === 'orderedList') {
          return `<ol class="list-decimal pl-6 my-4 space-y-2 text-slate-700">${innerHtml}</ol>`;
        }
        if (node.type === 'listItem') {
          return `<li>${innerHtml}</li>`;
        }
        if (node.type === 'blockquote') {
          return `<blockquote class="border-l-4 border-slate-300 pl-4 italic my-4 text-slate-600 whitespace-pre-line">${innerHtml}</blockquote>`;
        }
        if (node.type === 'image' || node.type === 'imageBlock' || node.type === 'singleImage') {
          const src = node.attrs?.src || node.attrs?.url || '';
          const alt = node.attrs?.alt || 'Hình ảnh xe Hyundai';
          const caption = node.attrs?.caption || '';
          return `
            <figure class="my-8 mx-auto max-w-4xl text-center not-prose">
              <div class="overflow-hidden rounded-2xl border border-slate-200/80 shadow-md bg-slate-100 group">
                <img src="${src}" alt="${alt}" loading="lazy" class="w-full h-auto object-cover max-h-[550px] transition-transform duration-300 group-hover:scale-[1.01]" />
              </div>
              ${caption ? `<figcaption class="mt-2.5 text-center text-xs sm:text-sm text-slate-500 italic font-medium flex items-center justify-center gap-1.5"><span class="inline-block w-1.5 h-1.5 rounded-full bg-blue-600"></span>${caption}</figcaption>` : ''}
            </figure>`;
        }
        if (node.type === 'imageGallery' || node.type === 'galleryBlock') {
          const title = node.attrs?.title || 'Bộ Sưu Tập Hình Ảnh Chi Tiết';
          const layout = node.attrs?.layout || node.attrs?.style || 'slider';
          const images = (node.attrs?.images as Array<{ url: string; alt?: string; caption?: string }>) || [];
          if (!images.length) return '';

          if (layout === 'grid') {
            const gridItems = images
              .map(
                (img) => `
              <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs group">
                <img src="${img.url}" alt="${img.alt || 'Hình ảnh'}" loading="lazy" class="w-full h-48 sm:h-56 object-cover transition-transform duration-300 group-hover:scale-105" />
                ${img.caption ? `<p class="p-2.5 text-xs text-slate-600 text-center italic bg-slate-50 border-t border-slate-100">${img.caption}</p>` : ''}
              </div>`
              )
              .join('');
            return `
              <div class="my-8 not-prose">
                ${title ? `<h3 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2"><span>📸</span> ${title}</h3>` : ''}
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">${gridItems}</div>
              </div>`;
          } else {
            const slides = images
              .map(
                (img, i) => `
              <div class="shrink-0 snap-center w-[85vw] sm:w-[380px] rounded-2xl overflow-hidden border border-slate-200/90 bg-white shadow-sm flex flex-col group">
                <div class="relative overflow-hidden aspect-[16/10] bg-slate-100">
                  <img src="${img.url}" alt="${img.alt || 'Hình ảnh'}" loading="lazy" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <span class="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-white text-[11px] font-mono">${i + 1}/${images.length}</span>
                </div>
                ${img.caption ? `<div class="p-3 text-xs text-slate-600 italic bg-white border-t border-slate-100">${img.caption}</div>` : ''}
              </div>`
              )
              .join('');
            return `
              <div class="my-8 not-prose">
                <div class="flex items-center justify-between mb-3">
                  ${title ? `<h3 class="text-xl font-bold text-slate-900 flex items-center gap-2"><span>📸</span> ${title}</h3>` : ''}
                  <span class="text-xs text-slate-400 font-medium hidden sm:inline">👈 Vuốt ngang để xem thêm 👉</span>
                </div>
                <div class="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-3 scrollbar-thin scrollbar-thumb-slate-300">${slides}</div>
              </div>`;
          }
        }
        if (node.type === 'specTable' || node.type === 'specComparisonBlock') {
          const title = node.attrs?.title || 'Bảng So Sánh Thông Số Kỹ Thuật';
          const versions = (node.attrs?.versions as string[]) || [];
          const rows = (node.attrs?.rows as Array<{ specName: string; values: string[] }>) || [];
          if (!versions.length || !rows.length) return '';

          const headerCols = versions
            .map((v) => `<th class="py-3.5 px-4 font-bold text-center text-white bg-[#002C6C] border-l border-blue-900/50 min-w-[160px]">${v}</th>`)
            .join('');
          const bodyRows = rows
            .map((r, idx) => {
              const isEven = idx % 2 === 0;
              const cells = (r.values || [])
                .map((val) => `<td class="py-3 px-4 text-center text-xs sm:text-sm text-slate-700 border-l border-slate-200">${val || '-'}</td>`)
                .join('');
              return `
                <tr class="${isEven ? 'bg-slate-50/70' : 'bg-white'} border-b border-slate-200/80 hover:bg-blue-50/40 transition-colors">
                  <td class="py-3 px-4 font-semibold text-xs sm:text-sm text-slate-900 min-w-[140px] sticky left-0 ${isEven ? 'bg-slate-50' : 'bg-white'} shadow-[2px_0_5px_rgba(0,0,0,0.03)]">${r.specName}</td>
                  ${cells}
                </tr>`;
            })
            .join('');

          return `
            <div class="my-8 not-prose">
              <h3 class="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2"><span>📊</span> ${title}</h3>
              <div class="overflow-x-auto rounded-2xl border border-slate-200/90 shadow-md bg-white scrollbar-thin">
                <table class="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr>
                      <th class="py-3.5 px-4 font-bold text-white bg-[#001A44] min-w-[140px] sticky left-0 z-10">Thông Số / Tính Năng</th>
                      ${headerCols}
                    </tr>
                  </thead>
                  <tbody>${bodyRows}</tbody>
                </table>
              </div>
              <p class="text-xs text-slate-400 mt-2 italic">* Thông số kỹ thuật có thể được điều chỉnh theo công bố mới nhất từ nhà sản xuất.</p>
            </div>`;
        }
        if (node.type === 'ctaButton' || node.type === 'ctaButtonBlock') {
          const buttonText = node.attrs?.buttonText || 'Liên Hệ Tư Vấn Ngay';
          const actionType = node.attrs?.actionType || 'hotline';
          const customUrl = node.attrs?.customUrl || '';
          const customPhone = (node.attrs?.phoneNumber as string || '').trim();
          const targetHotline = (customPhone ? customPhone.replace(/\D/g, '') : '') || defaultHotline;
          const targetZalo = (customPhone ? customPhone.replace(/\D/g, '') : '') || defaultZalo;
          const subtext = node.attrs?.subtext || '';
          const variant = node.attrs?.variant || 'red';

          let href = '#';
          let targetAttr = '';
          let onClickAttr = '';

          if (actionType === 'hotline') {
            href = `tel:${targetHotline}`;
          } else if (actionType === 'zalo') {
            href = `https://zalo.me/${targetZalo}`;
            targetAttr = 'target="_blank" rel="noopener noreferrer"';
          } else if (actionType === 'quoteForm') {
            href = '#lead-form';
            onClickAttr = 'onclick="document.getElementById(\'lead-form\')?.scrollIntoView({behavior:\'smooth\'})"';
          } else if (actionType === 'customLink') {
            href = customUrl || '#';
            targetAttr = 'target="_blank" rel="noopener noreferrer"';
          }

          let btnColor = 'bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-red-500/25';
          if (variant === 'blue') {
            btnColor = 'bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 hover:from-blue-800 hover:to-sky-700 text-white shadow-blue-500/25';
          } else if (variant === 'emerald') {
            btnColor = 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-emerald-500/25';
          }

          // Loại bỏ icon call theo yêu cầu người dùng, làm sạch nếu text có gắn kèm emoji 📞
          const cleanButtonText = buttonText.replace(/^\📞\s*/, '');

          return `
            <div class="my-8 mx-auto max-w-lg text-center not-prose p-5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
              <a href="${href}" ${targetAttr} ${onClickAttr} class="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 ${btnColor}">
                <span>${cleanButtonText}</span>
              </a>
              ${subtext ? `<p class="mt-2 text-xs text-slate-500 font-medium whitespace-pre-line">${subtext}</p>` : ''}
            </div>`;
        }
        if (node.type === 'prosCons' || node.type === 'prosConsBlock') {
          const title = node.attrs?.title || 'Đánh Giá Ưu & Nhược Điểm';
          const pros = (node.attrs?.pros as string[]) || [];
          const cons = (node.attrs?.cons as string[]) || [];

          const prosList = pros
            .filter(Boolean)
            .map(
              (p) => `
            <li class="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
              <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs shrink-0 font-bold mt-0.5">✓</span>
              <span class="leading-relaxed font-medium whitespace-pre-line">${p}</span>
            </li>`
            )
            .join('');

          const consList = cons
            .filter(Boolean)
            .map(
              (c) => `
            <li class="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
              <span class="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs shrink-0 font-bold mt-0.5">✕</span>
              <span class="leading-relaxed font-medium whitespace-pre-line">${c}</span>
            </li>`
            )
            .join('');

          return `
            <div class="my-8 not-prose">
              <h3 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2"><span>⚖️</span> ${title}</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/90 shadow-xs">
                  <div class="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-emerald-200">
                    <span class="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1">
                      👍 Ưu Điểm
                    </span>
                    <span class="text-xs text-emerald-800 font-bold">(${pros.length} điểm mạnh)</span>
                  </div>
                  <ul class="space-y-2.5">${prosList || '<li class="text-xs text-slate-400 italic">Đang cập nhật ưu điểm...</li>'}</ul>
                </div>
                <div class="p-5 rounded-2xl bg-rose-50/60 border border-rose-200/90 shadow-xs">
                  <div class="flex items-center gap-2 mb-3.5 pb-2.5 border-b border-rose-200">
                    <span class="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1">
                      👎 Nhược Điểm
                    </span>
                    <span class="text-xs text-rose-800 font-bold">(${cons.length} điểm lưu ý)</span>
                  </div>
                  <ul class="space-y-2.5">${consList || '<li class="text-xs text-slate-400 italic">Đang cập nhật nhược điểm...</li>'}</ul>
                </div>
              </div>
            </div>`;
        }
        if (node.type === 'faqBlock') {
          const questions = (node.attrs?.questions as Array<{ question: string; answer: string }>) || [];
          if (!questions.length) return '';
          const faqItems = questions
            .map(
              (q, i) => `
            <div class="border border-slate-200 rounded-xl p-4 bg-white shadow-sm mb-3">
              <div class="font-bold text-slate-900 flex items-center gap-2 mb-2 text-base">
                <span class="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs shrink-0 font-bold">${i + 1}</span>
                ${q.question || 'Câu hỏi'}
              </div>
              <p class="text-slate-600 text-sm pl-8 leading-relaxed whitespace-pre-line">${q.answer || 'Nội dung câu trả lời đang được cập nhật...'}</p>
            </div>`
            )
            .join('');
          return `
            <div class="my-8">
              <h3 class="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span>❓</span> Câu Hỏi Khách Hàng Quan Tâm (FAQ)
              </h3>
              <div class="space-y-3">${faqItems}</div>
            </div>`;
        }
        if (node.type === 'youtubeBlock') {
          const videoId = node.attrs?.videoId || '';
          const caption = node.attrs?.caption || '';
          return `
            <figure class="my-8">
              <div class="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-900 shadow-md">
                <iframe
                  src="https://www.youtube-nocookie.com/embed/${videoId}"
                  title="YouTube video player"
                  class="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                ></iframe>
              </div>
              ${caption ? `<figcaption class="text-center text-xs text-slate-500 mt-2 italic">${caption}</figcaption>` : ''}
            </figure>`;
        }
        if (node.type === 'tikTokBlock') {
          const videoId = node.attrs?.videoId || '';
          const title = node.attrs?.title || '';
          return `
            <div class="my-8 p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center">
              <p class="text-sm font-semibold text-slate-800 mb-2">🎬 ${title || 'Xem trên TikTok'}</p>
              <a href="https://www.tiktok.com/@hyundai/video/${videoId}" target="_blank" rel="noopener noreferrer" class="text-xs text-blue-600 hover:underline">
                Mở video TikTok (#${videoId}) &rarr;
              </a>
            </div>`;
        }
        if (node.type === 'relatedCarBlock') {
          const carName = node.attrs?.carName || 'Hyundai Accent 2026';
          const carSlug = node.attrs?.slug || 'hyundai-accent';
          const minPrice = Number(node.attrs?.minPrice) || 439000000;
          const imageUrl = node.attrs?.imageUrl || '/images/cars/accent.webp';
          const seatCount = Number(node.attrs?.seatCount) || 5;
          const fuelType = node.attrs?.fuelType || 'Xăng 1.5L Smartstream';
          const formattedPrice = minPrice.toLocaleString('vi-VN');
          return `
            <div class="my-8 p-5 rounded-2xl border border-slate-200 bg-gradient-to-r from-blue-50/50 to-white flex flex-col sm:flex-row items-center gap-5 shadow-sm">
              <img src="${imageUrl}" alt="${carName}" class="w-full sm:w-48 h-32 object-cover rounded-xl shrink-0" />
              <div class="flex-1">
                <span class="text-xs font-semibold text-blue-600 uppercase tracking-wider">Mẫu xe quan tâm</span>
                <h4 class="text-lg font-bold text-slate-900 mt-1">${carName}</h4>
                <div class="flex items-center gap-3 text-xs text-slate-500 mt-1 mb-2">
                  <span>💺 ${seatCount} chỗ ngồi</span>
                  <span>•</span>
                  <span>⛽ ${fuelType}</span>
                </div>
                <p class="text-sm text-slate-600">Giá niêm yết từ: <strong class="text-red-600 font-bold text-base">${formattedPrice} đ</strong></p>
                <a href="/xe/${carSlug}" class="inline-block mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors">
                  Xem chi tiết xe &rarr;
                </a>
              </div>
            </div>`;
        }
        if (node.type === 'priceTableBlock') {
          const title = node.attrs?.title || 'Bảng Giá Xe Hyundai Mới Nhất';
          const prices = (node.attrs?.prices as any[]) || [];
          let tableHtml = '';
          if (Array.isArray(prices) && prices.length > 0) {
            const rows = prices
              .map((p) => {
                const version = p.version || p.name || 'Phiên bản';
                const listed = Number(p.listedPrice || p.price || 0);
                const listedStr = listed > 0 ? `${listed.toLocaleString('vi-VN')}&nbsp;₫` : 'Liên hệ';
                const disc = Number(p.discount || 0);
                const discStr = disc > 0
                  ? `-${disc.toLocaleString('vi-VN')}&nbsp;₫`
                  : '<span class="text-slate-400 font-normal">Liên hệ</span>';
                const rolling = Number(p.rollingPrice || p.onRoadPriceEstimate || 0);
                const rollingStr = rolling > 0 ? `${rolling.toLocaleString('vi-VN')}&nbsp;₫` : 'Liên hệ';
                const cleanVersionEscaped = version.replace(/'/g, "\\'");

                return `
                  <tr class="border-b border-slate-100 hover:bg-blue-50/40 transition-colors">
                    <td class="py-3.5 px-4 font-semibold text-slate-900 text-left align-middle">
                      <div class="leading-snug">${version}</div>
                    </td>
                    <td class="py-3.5 px-4 text-right whitespace-nowrap text-slate-600 font-mono text-sm align-middle">
                      ${listedStr}
                    </td>
                    <td class="py-3.5 px-4 text-right whitespace-nowrap text-emerald-600 font-semibold font-mono text-sm align-middle">
                      ${discStr}
                    </td>
                    <td class="py-3.5 px-4 text-right whitespace-nowrap text-blue-700 font-bold font-mono text-base align-middle">
                      ${rollingStr}
                    </td>
                    <td class="py-3.5 px-4 text-center whitespace-nowrap align-middle">
                      <button
                        type="button"
                        onclick="
                          const form = document.getElementById('lead-form') || document.querySelector('[data-role=\\'lead-form\\']') || document.querySelector('form');
                          if (form) {
                            form.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            const inp = form.querySelector('input[type=\\'tel\\'], input[name=\\'phone\\'], input');
                            if (inp) {
                              setTimeout(() => {
                                inp.focus();
                                inp.setAttribute('placeholder', 'Nhận báo giá ${cleanVersionEscaped}...');
                              }, 400);
                            }
                          } else {
                            window.open('https://zalo.me/${defaultZalo}', '_blank');
                          }
                        "
                        class="inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-lg shadow-xs hover:shadow transition-all cursor-pointer whitespace-nowrap"
                        title="Nhận báo giá lăn bánh chi tiết cho ${cleanVersionEscaped}"
                      >
                        Báo giá
                      </button>
                    </td>
                  </tr>`;
              })
              .join('');

            tableHtml = `
              <div class="overflow-x-auto my-4 rounded-xl border border-slate-200 shadow-sm bg-white">
                <table class="w-full text-sm border-collapse">
                  <thead class="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-700">
                    <tr>
                      <th class="py-3.5 px-4 text-left w-[36%] min-w-[200px]">Phiên Bản Xe</th>
                      <th class="py-3.5 px-4 text-right whitespace-nowrap">Giá Niêm Yết</th>
                      <th class="py-3.5 px-4 text-right whitespace-nowrap">Ưu Đãi Đại Lý</th>
                      <th class="py-3.5 px-4 text-right whitespace-nowrap">Giá Lăn Bánh Tạm Tính</th>
                      <th class="py-3.5 px-4 text-center whitespace-nowrap w-[110px]">Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>${rows}</tbody>
                </table>
              </div>`;
          }

          return `
            <div class="my-8 p-4 sm:p-6 rounded-2xl border border-blue-200/80 bg-blue-50/40 shadow-xs">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                <h3 class="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                  ${title}
                </h3>
                <span class="text-xs text-blue-700 font-semibold flex items-center gap-1">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Báo giá cập nhật mới nhất
                </span>
              </div>
              ${tableHtml}
              <p class="text-xs text-slate-500 mt-2">* Giá lăn bánh tạm tính đã bao gồm VAT, lệ phí trước bạ, biển số và phí đường bộ. Giá thực tế có thể giảm sâu hơn tùy chính sách ưu đãi tháng.</p>
            </div>`;
        }
        if (node.type === 'leadFormBlock' || node.type === 'inlineQuickForm') {
          const headline = node.attrs?.headline || 'Nhận Báo Giá Lăn Bánh Chi Tiết Tận Tay';
          const subheadline = node.attrs?.subheadline || 'Để lại thông tin, chuyên viên tư vấn sẽ gửi bảng tính chi phí lăn bánh chính xác và số tiền trả góp hàng tháng qua Zalo trong 5 phút.';
          const buttonText = node.attrs?.buttonText || 'Gửi Báo Giá Ngay';
          const carName = node.attrs?.carName || 'Hyundai Accent / Creta';
          return `
            <div id="lead-form" data-role="lead-form" class="my-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-900 text-white shadow-xl">
              <div class="max-w-xl mx-auto text-center space-y-3">
                <span class="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider text-amber-300">
                  ⚡ Ưu Đãi Độc Quyền Showroom
                </span>
                <h3 class="text-2xl font-bold">${headline}</h3>
                <p class="text-sm text-blue-100 leading-relaxed whitespace-pre-line">${subheadline}</p>
                <form class="mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center max-w-md mx-auto" onsubmit="event.preventDefault(); alert('Cảm ơn bạn! Chuyên viên Hyundai Vinh sẽ liên hệ qua Zalo/SĐT trong 5 phút.');">
                  <input type="tel" placeholder="Nhập số điện thoại Zalo..." required class="w-full sm:flex-1 px-4 py-3 rounded-xl bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-slate-400 font-medium" />
                  <button type="submit" class="w-full sm:w-auto px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm rounded-xl shadow-lg transition-all shrink-0">
                    ${buttonText}
                  </button>
                </form>
                <p class="text-[11px] text-blue-200 mt-2">Áp dụng cho dòng xe: <strong>${carName}</strong> • Cam kết bảo mật thông tin 100%</p>
              </div>
            </div>`;
        }
        if (node.type === 'gatedContent') {
          // Legacy gatedContent → hiển thị dưới dạng nút CTA đơn giản (lấy Hotline từ Admin)
          const ctaTitle = (node.attrs?.title || 'Nhận Báo Giá Lăn Bánh Ưu Đãi').replace(/^\📞\s*/, '');
          return `
            <div class="my-8 mx-auto max-w-lg text-center not-prose p-5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
              <a href="tel:${defaultHotline}" class="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm sm:text-base shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-red-500/25">
                <span>${ctaTitle}</span>
              </a>
            </div>`;
        }
        if (node.type === 'horizontalRule') {
          return `<hr class="my-8 border-slate-200" />`;
        }
        return innerHtml;
      })
      .join('');
  };

  return renderNodes(doc.content);
}

// ============================================================================
// HÀM LẤY BÀI VIẾT THEO SLUG (API)
// ============================================================================
async function getPostBySlug(slug: string, token?: string): Promise<PostDetailData | null> {
  try {
    const endpoint = token ? `/api/posts/preview?token=${encodeURIComponent(token)}` : `/api/posts/${slug}`;
    const res = await apiClient.get<any>(endpoint, undefined, token ? { cache: 'no-store' } : undefined);
    const postData: PostDetailData | undefined = (res && res.slug) ? res : res?.data;
    if (postData && (postData.slug || postData.tieuDe)) {
      if (!postData.slug) postData.slug = slug;
      if (postData.noiDung && !postData.noiDungHtml) {
        postData.noiDungHtml = convertTiptapToHtml(postData.noiDung);
      }
      return postData;
    }
  } catch (err) {
    console.error('[getPostBySlug] Error fetching post:', err);
  }

  return null;
}

// ============================================================================
// SEO METADATA GENERATOR (CANONICAL + OPEN GRAPH + TWITTER)
// ============================================================================
export async function generateMetadata({ params, searchParams }: PostDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const search = searchParams ? await searchParams : undefined;
  const token = typeof search?.token === 'string' ? search.token : undefined;
  const post = await getPostBySlug(slug, token);

  if (!post) {
    return {
      title: 'Không tìm thấy bài viết | Hyundai Vinh',
      description: 'Bài viết bạn đang tìm kiếm không tồn tại hoặc đã được chuyển sang đường dẫn mới.',
      robots: { index: false, follow: true },
    };
  }

  const title = post.metaTitle || `${post.tieuDe} | Đại Lý Hyundai Vinh`;
  const description =
    post.metaDescription ||
    post.tomTat ||
    `Đọc bài viết ${post.tieuDe} chi tiết từ các chuyên gia tư vấn tại đại lý Hyundai Vinh.`;
  const canonicalUrl = `/tin-tuc/${post.slug}`;
  const imageUrl = post.anhDaiDienUrl.startsWith('http')
    ? post.anhDaiDienUrl
    : `https://xehyundaivinh.com${post.anhDaiDienUrl}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'article',
      publishedTime: post.publishedAt || post.createdAt,
      modifiedTime: post.updatedAt || post.publishedAt || post.createdAt,
      authors: [post.author?.fullName || 'Hyundai Vinh'],
      section: post.category?.tenChuyenMuc || 'Tin tức',
      tags: post.tags?.map((t) => t.tenTag || t.tag || '').filter(Boolean),
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.anhDaiDienAlt || post.tieuDe,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

// ============================================================================
// MAIN SERVER COMPONENT: POST DETAIL PAGE
// ============================================================================
export default async function PostDetailPage({ params, searchParams }: PostDetailPageProps) {
  const { slug } = await params;
  const search = searchParams ? await searchParams : undefined;
  const token = typeof search?.token === 'string' ? search.token : undefined;

  const [post, settings] = await Promise.all([
    getPostBySlug(slug, token),
    getStorefrontSettings(),
  ]);

  // Hotline & Zalo: Ưu tiên tác giả bài viết -> Cài đặt Admin (hotlineKinhDoanh/zaloNumber) -> Site Settings -> Fallback an toàn
  const rawHotline =
    post?.author?.phone ||
    settings.contact.hotlineKinhDoanh ||
    settings.contact.sellerPhone ||
    settings.site.phone ||
    '0981.234.567';
  const cleanHotline = rawHotline.replace(/\D/g, '') || '0981234567';

  const rawZalo =
    post?.author?.phone ||
    settings.contact.zaloNumber ||
    settings.contact.sellerZalo ||
    settings.contact.hotlineKinhDoanh ||
    rawHotline;
  const cleanZalo = rawZalo.replace(/\D/g, '') || cleanHotline;

  // 1. EMPTY / 404 STATE
  if (!post) {
    return (
      <main className="min-h-[70vh] bg-slate-50 flex items-center justify-center px-4 py-16">
        <Card className="max-w-lg w-full text-center p-8 bg-white border border-slate-200 shadow-sm rounded-2xl">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FileQuestion className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Không tìm thấy bài viết</h1>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            Nội dung bài viết với đường dẫn <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-blue-800">/{slug}</span> có thể đã được thay đổi hoặc tạm ẩn.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/tin-tuc">
              <Button variant="outline" className="w-full sm:w-auto h-11 px-5 border-slate-300">
                <ArrowLeft className="w-4 h-4 mr-2" /> Về Hub Tin tức
              </Button>
            </Link>
            <a href={`tel:${cleanHotline}`}>
              <Button className="w-full sm:w-auto h-11 px-5 bg-blue-700 hover:bg-blue-800 text-white font-medium">
                <Phone className="w-4 h-4 mr-2" /> Hotline {rawHotline}
              </Button>
            </a>
          </div>
        </Card>
      </main>
    );
  }

  // Luôn nạp lại HTML bài viết với thông tin hotline/zalo từ Admin Settings
  if (post.noiDung) {
    post.noiDungHtml = convertTiptapToHtml(post.noiDung, {
      hotline: cleanHotline,
      rawHotline,
      zalo: cleanZalo,
    });
  }

  // 2. CHUẨN BỊ MASTER SCHEMA JSON-LD (@cardealer/core)
  const postForJsonLd: PostForJsonLd = {
    id: post.id,
    tieuDe: post.tieuDe,
    slug: post.slug,
    tomTat: post.tomTat,
    anhDaiDienUrl: post.anhDaiDienUrl,
    anhDaiDienAlt: post.anhDaiDienAlt,
    publishedAt: post.publishedAt || post.createdAt,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    category: post.category ? { id: post.category.id, name: post.category.tenChuyenMuc, slug: post.category.slug } : undefined,
    author: post.author
      ? {
        id: post.author.id,
        name: post.author.fullName,
        jobTitle: post.author.role,
        avatarUrl: post.author.avatarUrl || undefined,
        phone: post.author.phone || undefined,
      }
      : undefined,
    noiDung: post.noiDungAst || undefined,
  };

  const masterSchema = generatePostMasterJsonLd(postForJsonLd, 'https://xehyundaivinh.com', {
    defaultAuthor: {
      name: post.author?.fullName || 'Ban Biên Tập Hyundai Vinh',
      jobTitle: post.author?.role || 'Chuyên gia tư vấn xe ô tô Hyundai',
      avatarUrl: post.author?.avatarUrl ? `https://xehyundaivinh.com${post.author.avatarUrl}` : undefined,
      phone: post.author?.phone || rawHotline,
    },
  });

  const formattedDate = new Date(post.publishedAt || post.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <article className="min-h-screen bg-slate-50 text-slate-800 antialiased">
      {/* 🧠 Live Preview Banner nếu đang truy cập qua secret token */}
      {token && (
        <div className="bg-amber-400 text-slate-950 px-4 py-2.5 text-center text-xs sm:text-sm font-semibold sticky top-0 z-50 shadow-md flex items-center justify-center gap-2 border-b border-amber-500">
          <Eye className="w-4 h-4 shrink-0 text-slate-900" />
          <span>
            Chế độ Xem Trước Bí Mật — Trạng thái: <strong className="uppercase bg-slate-900 text-white px-2 py-0.5 rounded text-xs">{(post as any).status === 'published' ? 'Đã xuất bản' : 'Bản nháp (Chưa xuất bản)'}</strong>
          </span>
        </div>
      )}

      {/* 🧠 5 Schemas JSON-LD Master Graph */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(masterSchema) }}
      />

      {/* ======================================================================
          1. BREADCRUMBS PHÂN CẤP CHUẨN SEO
      ====================================================================== */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav aria-label="Breadcrumb" className="flex items-center text-xs sm:text-sm text-slate-500 overflow-x-auto whitespace-nowrap scrollbar-none">
            <Link href="/" className="hover:text-blue-700 transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0 text-slate-400" />
            <Link href="/tin-tuc" className="hover:text-blue-700 transition-colors">
              Tin tức
            </Link>
            {post.category && (
              <>
                <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0 text-slate-400" />
                <Link
                  href={`/tin-tuc?chuyenMuc=${post.category.slug}`}
                  className="hover:text-blue-700 transition-colors"
                >
                  {post.category.tenChuyenMuc}
                </Link>
              </>
            )}
            <ChevronRight className="w-4 h-4 mx-2 flex-shrink-0 text-slate-400" />
            <span className="text-slate-900 font-medium truncate max-w-xs sm:max-w-md" title={post.tieuDe}>
              {post.tieuDe}
            </span>
          </nav>
        </div>
      </div>

      {/* ======================================================================
          2. HEADER BÀI VIẾT (HERO SECTION)
      ====================================================================== */}
      <header className="bg-white border-b border-slate-200/80 pt-8 pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Badge chuyên mục */}
          {post.category && (
            <div className="mb-4">
              <Link href={`/tin-tuc?chuyenMuc=${post.category.slug}`}>
                <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs px-3 py-1 font-semibold uppercase tracking-wider rounded-md transition-colors">
                  {post.category.tenChuyenMuc}
                </Badge>
              </Link>
            </div>
          )}

          {/* H1 Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-[1.25] mb-6">
            {post.tieuDe}
          </h1>

          {/* E-E-A-T Metadata Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-slate-100 text-xs sm:text-sm text-slate-500">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-bold text-blue-800 text-sm overflow-hidden flex-shrink-0">
                {post.author?.fullName ? post.author.fullName.charAt(0).toUpperCase() : <User className="w-5 h-5 text-blue-700" />}
              </div>
              <div>
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <span>{post.author?.fullName || 'Ban Biên Tập Hyundai Vinh'}</span>
                  <span title="Tác giả được xác minh bởi Hyundai Vinh" className="inline-flex">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  </span>
                </div>
                <div className="text-xs text-slate-500">{post.author?.role || 'Chuyên gia tư vấn xe'}</div>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-4 text-slate-500">
              <span className="flex items-center gap-1.5" title="Ngày xuất bản">
                <Calendar className="w-4 h-4 text-slate-400" />
                <time dateTime={post.publishedAt || post.createdAt}>{formattedDate}</time>
              </span>
              <span className="flex items-center gap-1.5" title="Thời gian đọc ước tính">
                <Clock className="w-4 h-4 text-slate-400" />
                {post.readingTime || 4} phút đọc
              </span>
              {post.viewCount !== undefined && (
                <span className="hidden sm:flex items-center gap-1.5" title="Lượt xem">
                  <Eye className="w-4 h-4 text-slate-400" />
                  {post.viewCount.toLocaleString('vi-VN')} xem
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ======================================================================
          3. NỘI DUNG CHÍNH (2 CỘT: CONTENT + SIDEBAR)
      ====================================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* CỘT TRÁI: BÀI VIẾT CHI TIẾT (8 CỘT) */}
          <section className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm">
            {/* Ảnh đại diện 16:9 */}
            {post.anhDaiDienUrl && (
              <figure className="mb-8 rounded-xl overflow-hidden border border-slate-100 bg-slate-100">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={post.anhDaiDienUrl}
                    alt={post.anhDaiDienAlt || post.tieuDe}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.01]"
                    loading="eager"
                  />
                </div>
                {post.anhDaiDienAlt && (
                  <figcaption className="text-center text-xs text-slate-500 py-2.5 px-4 bg-slate-50 border-t border-slate-100 italic">
                    {post.anhDaiDienAlt}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Sapo Tóm Tắt Mở Đầu */}
            {post.tomTat && (
              <div className="p-4 sm:p-5 rounded-xl bg-blue-50/70 border-l-4 border-blue-600 text-slate-800 text-base sm:text-lg font-medium leading-relaxed mb-8 whitespace-pre-line">
                {post.tomTat}
              </div>
            )}

            {/* Nội dung Tiptap / Render Content Blocks */}
            <div className="prose prose-slate prose-lg max-w-none space-y-6 text-slate-700 leading-relaxed">
              {post.noiDungHtml ? (
                <div
                  dangerouslySetInnerHTML={{ __html: post.noiDungHtml }}
                  className="space-y-4"
                />
              ) : (
                <p className="text-slate-500 italic">Nội dung bài viết đang được cập nhật.</p>
              )}
            </div>

            {/* Tags bài viết */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-10 pt-6 border-t border-slate-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-slate-400 mr-1" />
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Từ khóa:</span>
                  {post.tags.map((tag) => {
                    const tagLabel = tag.tenTag || tag.tag || '';
                    if (!tagLabel) return null;
                    return (
                      <Link
                        key={tag.id}
                        href={`/tin-tuc?q=${encodeURIComponent(tagLabel)}`}
                        className="inline-block px-3 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded-md text-xs font-medium transition-colors"
                      >
                        #{tagLabel}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Chân Tác Giả E-E-A-T Chuẩn Google & Inbound Contact */}
            <EeatAuthorBox
              author={
                post.author
                  ? {
                    fullName: post.author.fullName,
                    role: post.author.role,
                    avatarUrl: post.author.avatarUrl,
                    phone: post.author.phone,
                  }
                  : null
              }
              postTitle={post.tieuDe}
              className="mt-8"
            />
          </section>

          {/* CỘT PHẢI: CONVERSION SIDEBAR (4 CỘT) */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            {/* Mục Lục Bài Viết Thông Minh (StickyToc Client Island) */}
            <StickyToc className="mb-2" />

            {/* Khung Tư Vấn Trực Tiếp 24/7 */}
            <Card className="p-6 bg-gradient-to-br from-blue-900 via-blue-950 to-slate-950 text-white rounded-2xl border-none shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10">
                <span className="inline-block px-2.5 py-1 bg-blue-500/20 text-blue-300 text-[11px] font-semibold tracking-wider uppercase rounded-md mb-3">
                  Hỗ Trợ Khách Hàng 24/7
                </span>
                <h3 className="text-xl font-bold mb-2">Đăng Ký Tư Vấn & Lái Thử Tại Nhà</h3>
                <p className="text-xs text-blue-200 leading-relaxed mb-5">
                  Trải nghiệm trực tiếp các dòng xe Hyundai mới nhất tại nhà riêng hoặc cơ quan hoàn toàn miễn phí.
                </p>
                <div className="space-y-3">
                  <a
                    href={`tel:${cleanHotline}`}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-all motion-reduce:transition-none"
                  >
                    <Phone className="w-4 h-4 animate-pulse motion-reduce:animate-none" />
                    Hotline: {rawHotline}
                  </a>
                  <a
                    href={`https://zalo.me/${cleanZalo}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-xl border border-white/20 transition-colors"
                  >
                    Nhắn Zalo Tư Vấn Miễn Phí
                  </a>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-blue-200">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Cam kết giá tốt nhất
                  </span>
                  <span>Duyệt hồ sơ 24h</span>
                </div>
              </div>
            </Card>

            {/* Khung Khuyến Mãi Nổi Bật */}
            <Card className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <h4 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Chính Sách Ưu Đãi Đặc Biệt
              </h4>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Giảm 50% đến 100% lệ phí trước bạ cho xe lắp ráp trong nước.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Tặng phụ kiện cao cấp: Dán phim Lummax, lót sàn da 6D, camera hành trình.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Hỗ trợ trả góp lãi suất 0% trong 6 tháng đầu hoặc cố định 8 năm.</span>
                </li>
              </ul>
            </Card>

            {/* Nút Quay Lại Danh Sách */}
            <div className="text-center pt-2">
              <Link
                href="/tin-tuc"
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-700 font-medium transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Xem tất cả bài viết tin tức khác
              </Link>
            </div>
          </aside>
        </div>
      </div>

      {/* 4. Client Islands: Thanh điều hướng đáy Mobile & Banner trượt góc Exit-Intent */}
      <PostBottomBar
        phone={rawHotline}
        zaloPhone={cleanZalo}
        categorySlug={post.category?.slug || ''}
        carName="Hyundai"
      />
      <SlideInBanner
        postId={post.id}
        carName="Hyundai"
        utmSource={`post_${post.slug}`}
        hotline={rawHotline}
        phoneToCall={cleanHotline}
      />
    </article>
  );
}

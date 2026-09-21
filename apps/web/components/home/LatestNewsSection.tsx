import React from 'react';
import Link from 'next/link';
import { Newspaper, ArrowRight, Calendar } from 'lucide-react';
import type { LatestPromotionsZoneConfig } from '@cardealer/types';

export interface ArticlePreview {
  id: string;
  title: string;
  slug: string;
  summary: string;
  thumbnailUrl: string;
  publishedAt: string;
}

export interface LatestNewsSectionProps {
  config: LatestPromotionsZoneConfig;
  posts?: ArticlePreview[];
}

// 🧠 Mental Model: Phân khu 6 - Latest News & Special Promotions.
// 1. Áp dụng Graceful Degradation: Nếu config.enabled = false HOẶC danh sách bài viết rỗng ➡️ return null hoàn toàn.
// 2. Tự động ẩn thanh lịch khi saler chưa kịp viết bài tin tức thật, bảo vệ tính thẩm mỹ của Storefront.
export const LatestNewsSection: React.FC<LatestNewsSectionProps> = ({ config, posts = [] }) => {
  if (!config || !config.enabled || !posts || posts.length === 0) {
    return null;
  }

  const displayPosts = posts.slice(0, config.maxPosts || 3);

  return (
    <section className="py-12 sm:py-16 bg-white relative" aria-label="Tin Tức & Khuyến Mãi">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200/80 text-purple-800 text-xs font-bold">
              <Newspaper className="w-3.5 h-3.5 text-purple-600" />
              <span>Chính Sách Bán Hàng & Ưu Đãi Mới Nhất</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              {config.headline}
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              {config.subheadline}
            </p>
          </div>

          <Link
            href="/tin-tuc"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-bold text-[#002C6C] hover:text-[#0072CE] transition-colors"
          >
            <span>Xem Tất Cả Tin Tức</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayPosts.map((post) => (
            <Link
              key={post.id}
              href={`/tin-tuc/${post.slug}`}
              className="group rounded-3xl bg-white border border-slate-200/80 hover:border-sky-300 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative w-full aspect-[16/9] bg-slate-100 overflow-hidden">
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url(${post.thumbnailUrl || '/images/news/default.webp'})` }}
                  />
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
                    <Calendar className="w-3.5 h-3.5 text-[#0072CE]" />
                    <span>{post.publishedAt}</span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#002C6C] transition-colors line-clamp-2">
                    {post.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                    {post.summary}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-0 flex items-center gap-1.5 text-xs font-bold text-[#002C6C] group-hover:text-[#0072CE] transition-colors">
                <span>Đọc bài viết</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

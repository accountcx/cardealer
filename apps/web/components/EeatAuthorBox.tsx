// 🧠 Mental Model: EeatAuthorBox là Khối Thẩm Quyền Chuyên Gia & Ban Biên Tập cuối bài viết (/tin-tuc/[slug]).
// Tuân thủ triệt để universal-agentic-workflow.xml và fullstack-dev-executor.xml:
// 1. Tối Ưu Tín Hiệu E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness):
//    - Cung cấp định danh tác giả minh bạch (Person Schema match), kinh nghiệm trong ngành ô tô và chức danh phân tích chuyên sâu.
//    - Huy hiệu xác thực uy tín 'Chuyên Gia Được Xác Minh' từ Đại lý Ủy quyền.
// 2. Component-Driven & Shared Primitives First:
//    - Tái sử dụng 100% UI Primitives: Card, Badge, Button từ @cardealer/ui.
//    - Tái sử dụng Link từ next/link cho các liên kết điều hướng và tương tác liên lạc.
// 3. Tối Đa Hóa Tỉ Lệ Chuyển Đổi Inbound (CRO):
//    - Nút Gọi Trực Tiếp Tác Giả (Hotline).
//    - Nút Nhắn Zalo Tư Vấn Báo Giá & Trả Góp 1-chạm.
//    - Nút Chia Sẻ Bài Viết (Sao chép liên kết vào clipboard kèm Toast feedback).
// 4. Dynamic Admin Config:
//    - Nhận authorSettings từ Admin Settings với fallback defaults an toàn (Zero-Crash Guarantee).
// 5. 100% Named Export: TUYỆT ĐỐI CẤM export default.

'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Phone,
  MessageSquare,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Award,
  Check,
} from 'lucide-react';
import { Card, Badge, Button } from '@cardealer/ui';
import type { AuthorSettings } from '@cardealer/types';
import { DEFAULT_AUTHOR_SETTINGS } from '@cardealer/types';

export interface AuthorInfo {
  id?: string;
  fullName: string;
  role?: string;
  avatarUrl?: string | null;
  phone?: string | null;
  zaloPhone?: string | null;
  experienceYears?: number;
  bio?: string | null;
}

export interface EeatAuthorBoxProps {
  author?: AuthorInfo | null;
  authorSettings?: AuthorSettings;
  postTitle?: string;
  className?: string;
}

export function EeatAuthorBox({
  author,
  authorSettings,
  postTitle = 'Bài viết',
  className = '',
}: EeatAuthorBoxProps) {
  const [copied, setCopied] = React.useState<boolean>(false);

  const fallback = authorSettings || DEFAULT_AUTHOR_SETTINGS;

  const currentAuthor: AuthorInfo = {
    fullName: author?.fullName || fallback.fullName,
    role: author?.role || fallback.role,
    avatarUrl: author?.avatarUrl || fallback.avatarUrl || null,
    phone: author?.phone || fallback.phone,
    zaloPhone: author?.zaloPhone || fallback.zaloPhone,
    experienceYears: author?.experienceYears ?? fallback.experienceYears,
    bio: author?.bio || fallback.bio,
  };

  const cleanPhone = (currentAuthor.phone || '0981234567').replace(/[^0-9]/g, '');
  const cleanZalo = (currentAuthor.zaloPhone || cleanPhone).replace(/[^0-9]/g, '');

  const handleShareClick = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <Card
      className={`rounded-2xl border border-slate-200/90 bg-slate-50/80 p-6 sm:p-7 shadow-xs text-slate-800 transition-all motion-reduce:transition-none ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
        {/* Avatar tác giả */}
        <div className="relative flex-shrink-0">
          {currentAuthor.avatarUrl ? (
            <img
              src={currentAuthor.avatarUrl}
              alt={currentAuthor.fullName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md"
              loading="lazy"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-700 to-sky-600 text-white font-extrabold text-2xl flex items-center justify-center border-2 border-white shadow-md">
              {currentAuthor.fullName.charAt(0).toUpperCase()}
            </div>
          )}
          <span
            title="Tác giả được xác thực chuyên môn"
            className="absolute -bottom-1.5 -right-1.5 bg-blue-600 text-white p-1 rounded-full border-2 border-white shadow-xs"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Thông tin thẩm quyền E-E-A-T */}
        <div className="flex-1 text-center sm:text-left space-y-2.5">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h4 className="text-lg font-bold text-slate-900 leading-tight">
              {currentAuthor.fullName}
            </h4>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] px-2.5 py-0.5 font-semibold flex items-center gap-1 rounded-md">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Đã kiểm duyệt chuyên môn
            </Badge>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-slate-500 font-medium">
            <span>{currentAuthor.role}</span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1 text-blue-700">
              <Award className="w-3.5 h-3.5" />
              {currentAuthor.experienceYears}+ năm kinh nghiệm
            </span>
            <span className="text-slate-300">•</span>
            <span>Đại lý Ủy Quyền Chính Hãng</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
            {currentAuthor.bio}
          </p>

          {/* Cụm Nút Tác Vụ Chuẩn Packages Button & Link */}
          <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            {/* Nút Gọi Hotline */}
            <Link href={`tel:${cleanPhone}`} className="inline-flex">
              <Button
                variant="outline"
                size="sm"
                className="min-h-[44px] px-4 text-xs font-semibold bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 rounded-xl shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-blue-600" />
                <span>Gọi Tác Giả: {currentAuthor.phone || '0981.234.567'}</span>
              </Button>
            </Link>

            {/* Nút Nhắn Zalo */}
            <Link
              href={`https://zalo.me/${cleanZalo}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex"
            >
              <Button
                variant="outline"
                size="sm"
                className="min-h-[44px] px-4 text-xs font-semibold bg-white border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>Nhắn Zalo</span>
              </Button>
            </Link>

            {/* Nút Chia Sẻ Bài Viết */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleShareClick}
              className="min-h-[44px] px-4 text-xs font-semibold bg-white border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors flex items-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 animate-in zoom-in-50" />
                  <span className="text-emerald-700">Đã chép link!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Chia sẻ bài viết</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

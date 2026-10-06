// 🧠 Mental Model: EeatAuthorBox là Khối Thẩm Quyền Chuyên Gia & Ban Biên Tập cuối bài viết (/tin-tuc/[slug]).
// Tuân thủ triệt để universal-agentic-workflow.xml và fullstack-dev-executor.xml:
// 1. Tối Ưu Tín Hiệu E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness):
//    - Cung cấp định danh tác giả minh bạch (Person Schema match), kinh nghiệm trong ngành ô tô và chức danh phân tích chuyên sâu.
//    - Huy hiệu xác thực uy tín 'Chuyên Gia Được Xác Minh' từ Đại lý Ủy quyền.
// 2. Component-Driven & Shared Primitives First:
//    - Tái sử dụng 100% UI Primitives: Card, Badge từ @cardealer/ui.
// 3. Dynamic Admin Config:
//    - Nhận authorSettings từ Admin Settings với fallback defaults an toàn (Zero-Crash Guarantee).
// 4. 100% Named Export: TUYỆT ĐỐI CẤM export default.

'use client';

import * as React from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { Card, Badge } from '@cardealer/ui';
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

/**
 * Loại bỏ các hậu tố chức danh kỹ thuật nội bộ (ví dụ: " - Quản Trị Showroom", " - Admin")
 * để hiển thị tên tác giả trang nhã, đúng chuẩn bài viết báo chí & SEO E-E-A-T.
 */
function cleanAuthorFullName(name?: string | null): string {
  if (!name) return 'Ban Biên Tập Hyundai Vinh';
  return name.replace(/\s*-\s*(Quản Trị Showroom|Quản Trị Viên|Admin|Quản Lý|Nhân Viên).*$/gi, '').trim();
}

export function EeatAuthorBox({
  author,
  authorSettings,
  className = '',
}: EeatAuthorBoxProps) {
  const fallback = authorSettings || DEFAULT_AUTHOR_SETTINGS;

  const isTechnicalRole = (r?: string | null) => {
    if (!r) return true;
    const lower = r.trim().toLowerCase();
    return [
      'admin',
      'manager',
      'saler',
      'sales',
      'user',
      'editor',
      'superadmin',
      'quản trị showroom',
      'quản trị viên',
      'quản lý',
      'nhân viên',
    ].includes(lower);
  };

  const resolvedRole = !isTechnicalRole(author?.role)
    ? author!.role!
    : fallback.role;

  const rawFullName = author?.fullName || fallback.fullName;
  const displayFullName = cleanAuthorFullName(rawFullName);

  const currentAuthor: AuthorInfo = {
    fullName: displayFullName,
    role: resolvedRole,
    avatarUrl: author?.avatarUrl || fallback.avatarUrl || null,
    phone: author?.phone || fallback.phone,
    zaloPhone: author?.zaloPhone || fallback.zaloPhone,
    experienceYears: author?.experienceYears ?? fallback.experienceYears,
    bio: author?.bio || fallback.bio,
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
        </div>
      </div>
    </Card>
  );
}

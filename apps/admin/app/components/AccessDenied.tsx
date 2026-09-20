'use client';

// 🧠 Mental Model: Component chặn truy cập 403 Forbidden chuẩn thiết kế Hyundai Design System.
// Hiển thị khi người dùng không đủ quyền RBAC truy cập trực tiếp vào route thông qua thanh địa chỉ URL.

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@cardealer/ui';

interface AccessDeniedProps {
  title?: string;
  message?: string;
  requiredPermission?: string;
}

export function AccessDenied({
  title = 'Truy Cập Bị Giới Hạn (403)',
  message = 'Tài khoản của bạn không có quyền truy cập hoặc thực hiện thao tác trên phân hệ này theo chính sách bảo mật RBAC.',
  requiredPermission,
}: AccessDeniedProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 select-none animate-in fade-in duration-300">
      {/* Icon Shield with Ambient Glow */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-[0_0_40px_rgba(244,63,94,0.18)]">
          <ShieldAlert size={40} />
        </div>
      </div>

      {/* Badge Error Code */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider mb-3">
        403 Forbidden {requiredPermission ? `• Yêu cầu ${requiredPermission}` : ''}
      </div>

      {/* Main Title */}
      <h1 className="text-2xl font-extrabold text-white tracking-tight mb-2">
        {title}
      </h1>

      {/* Subtitle / Explanation */}
      <p className="text-sm text-slate-400 max-w-md mb-8 leading-relaxed">
        {message}
      </p>

      {/* Back to Safe Area Button */}
      <Link href="/cars">
        <Button
          variant="secondary"
          size="md"
          leftIcon={<ArrowLeft size={16} />}
          className="text-xs font-semibold px-5"
        >
          Quay Lại Danh Sách Xe
        </Button>
      </Link>
    </div>
  );
}

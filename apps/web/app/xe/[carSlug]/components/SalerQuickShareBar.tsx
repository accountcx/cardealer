'use client';

import React, { useState, useEffect } from 'react';
import { Share2, Check, Copy } from 'lucide-react';
import { Button } from '@cardealer/ui';

interface SalerQuickShareBarProps {
  carName: string;
  versionName: string;
  colorName?: string | null;
}

/**
 * 🧠 Mental Model: Nút công cụ bán hàng 1 chạm cho Saler (Quick Share Deep Link).
 * Giúp Saler hoặc Khách hàng copy ngay liên kết cấu hình xe đang chọn (kèm phiên bản và màu sơn)
 * để gửi nhanh qua Zalo, Messenger, SMS hoặc lưu lại xem sau.
 * Có feedback Toast trực quan và tích hợp Web Share API nếu trình duyệt di động hỗ trợ.
 */
export function SalerQuickShareBar({
  carName,
  versionName,
  colorName,
}: SalerQuickShareBarProps) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  // 🧠 Mental Model: SSR Hydration Guard: Chỉ kiểm tra Web Share API sau khi component mount trên client
  // Ngăn chặn triệt để lỗi Hydration Mismatch giữa HTML render trên server (không có navigator) và client.
  useEffect(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      setCanShare(true);
    }
  }, []);

  const handleCopyLink = async () => {
    if (typeof window === 'undefined') return;

    const currentUrl = window.location.href;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(currentUrl);
      } else {
        // Fallback cho trình duyệt cũ
        const textArea = document.createElement('textarea');
        textArea.value = currentUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('[SalerQuickShareBar] Không thể sao chép liên kết:', err);
    }
  };

  const handleNativeShare = async () => {
    if (typeof window === 'undefined') return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${carName} ${versionName}`,
          text: `Xem chi tiết xe ${carName} ${versionName}${colorName ? ` - Màu ${colorName}` : ''} kèm giá lăn bánh và ưu đãi mới nhất:`,
          url: window.location.href,
        });
      } catch (err) {
        // Người dùng hủy share hoặc không hỗ trợ, fallback sang copy
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
      <div className="flex items-center gap-2 text-slate-600 truncate">
        <Share2 className="w-4 h-4 text-blue-600 shrink-0" />
        <span className="truncate">
          Chia sẻ cấu hình: <strong className="text-slate-900">{versionName}</strong>
          {colorName && <span> ({colorName})</span>}
        </span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          type="button"
          size="sm"
          variant={copied ? 'success' : 'outline'}
          leftIcon={
            copied ? (
              <Check className="w-3.5 h-3.5 text-white" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-600" />
            )
          }
          onClick={handleCopyLink}
          className={`h-8 px-3 rounded-xl font-bold text-xs transition-all duration-150 active:scale-95 ${
            copied
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
          }`}
          title="Sao chép đường link cấu hình xe để gửi Zalo cho khách"
        >
          {copied ? 'Đã sao chép!' : 'Sao chép link'}
        </Button>

        {canShare && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleNativeShare}
            className="h-8 w-8 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border-slate-200"
            title="Gửi qua ứng dụng khác"
          >
            <Share2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

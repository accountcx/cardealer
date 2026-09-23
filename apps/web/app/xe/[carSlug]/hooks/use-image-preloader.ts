'use client';

import { useEffect, useRef } from 'react';

// Bộ nhớ đệm RAM lưu danh sách các URL ảnh xe đã được nạp trước thành công
const globalPreloadCache = new Set<string>();

/**
 * 🧠 Mental Model: Memory Preloader Engine cho ảnh xe theo màu ngoại thất.
 * Tự động chạy ngầm (Background Preload) toàn bộ ảnh màu của phiên bản hiện tại
 * vào bộ nhớ RAM trình duyệt ngay khi phiên bản được chọn.
 *
 * Giúp người dùng click chuyển qua lại giữa các màu xe phản hồi chớp mắt (< 50ms),
 * loại bỏ hoàn toàn độ trễ mạng và hiện tượng chớp nháy giật lag (CLS = 0).
 */
export function useImagePreloader(imageUrls: (string | null | undefined)[]) {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    if (typeof window === 'undefined') return;

    const validUrls = imageUrls.filter((url): url is string => Boolean(url && url.trim().length > 0));

    validUrls.forEach((url) => {
      if (globalPreloadCache.has(url)) return;

      const img = new window.Image();
      img.src = url;

      img.onload = () => {
        globalPreloadCache.add(url);
      };

      img.onerror = () => {
        // Ghi log nhẹ để debug nhưng không làm gián đoạn UI
        console.warn(`[Image Preloader] Không thể nạp trước ảnh: ${url}`);
      };
    });

    return () => {
      isMountedRef.current = false;
    };
  }, [imageUrls]);

  const isPreloaded = (url: string) => globalPreloadCache.has(url);

  return { isPreloaded };
}

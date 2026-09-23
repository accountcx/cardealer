'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { CarDetail, CarDetailVersion, VersionColor } from '@cardealer/types';

// 🧠 Mental Model: Bảng màu chuẩn Hyundai chính hãng dùng làm fallback đảm bảo
// khách hàng luôn luôn có thể trải nghiệm chọn màu phong thủy/sở thích trực quan ngay cả khi DB chưa cấu hình đủ màu
export const DEFAULT_HYUNDAI_COLORS: VersionColor[] = [
  {
    colorId: 'color-white',
    tenMau: 'Trắng Ngọc Trai',
    slug: 'trang-ngoc-trai',
    hexCode: '#F8F9FA',
    isTwoTone: false,
    isDefault: true,
  },
  {
    colorId: 'color-red',
    tenMau: 'Đỏ Mận Quyến Rũ',
    slug: 'do-man-quyen-ru',
    hexCode: '#991B1B',
    isTwoTone: false,
    isDefault: false,
  },
  {
    colorId: 'color-black',
    tenMau: 'Đen Huyền Bí',
    slug: 'den-huyen-bi',
    hexCode: '#1E293B',
    isTwoTone: false,
    isDefault: false,
  },
  {
    colorId: 'color-silver',
    tenMau: 'Bạc Ánh Kim',
    slug: 'bac-anh-kim',
    hexCode: '#CBD5E1',
    isTwoTone: false,
    isDefault: false,
  },
  {
    colorId: 'color-grey',
    tenMau: 'Xám Titan',
    slug: 'xam-titan',
    hexCode: '#64748B',
    isTwoTone: false,
    isDefault: false,
  },
  {
    colorId: 'color-blue',
    tenMau: 'Xanh Dương Cá Tính',
    slug: 'xanh-duong-ca-tinh',
    hexCode: '#1D4ED8',
    isTwoTone: false,
    isDefault: false,
  },
];

interface UseCarDetailUrlSyncProps {
  car: CarDetail;
  initialVersionSlug?: string | null;
  initialColorSlug?: string | null;
}

/**
 * 🧠 Mental Model: Hook đồng bộ trạng thái 2 chiều giữa UI và URL Query Parameters.
 * - Quản lý URL Query (?phien-ban=...&mau=...) qua window.history.replaceState (không gây giật lag trang).
 * - Bắt sự kiện 'popstate' để hỗ trợ các nút Back/Forward của trình duyệt.
 * - Tự động fallback an toàn nếu slug trên URL bị sai hoặc bị gõ bậy.
 * - Tự động đồng bộ màu sơn khi đổi phiên bản (nếu bản mới không có màu cũ, chuyển sang màu mặc định).
 */
export function useCarDetailUrlSync({
  car,
  initialVersionSlug,
  initialColorSlug,
}: UseCarDetailUrlSyncProps) {
  const versions = useMemo(() => car.versions || [], [car.versions]);

  // Tìm phiên bản khởi tạo
  const findVersion = useCallback(
    (slug?: string | null): CarDetailVersion => {
      if (slug && versions.length > 0) {
        const found = versions.find((v) => v.slug === slug);
        if (found) return found;
      }
      return versions[0] || ({} as CarDetailVersion);
    },
    [versions]
  );

  // Tìm màu sắc khởi tạo trong phiên bản (fallback bảng màu Hyundai chuẩn)
  const findColor = useCallback(
    (version: CarDetailVersion, colorSlug?: string | null): VersionColor => {
      let colors = version?.colors || [];
      if (colors.length === 0) {
        const anyVersionColors = versions.find((v) => v.colors && v.colors.length > 0)?.colors;
        colors = anyVersionColors && anyVersionColors.length > 0 ? anyVersionColors : DEFAULT_HYUNDAI_COLORS;
      }

      if (colorSlug) {
        const matched = colors.find((c) => c.slug === colorSlug);
        if (matched) return matched;
      }

      // Ưu tiên màu mặc định (isDefault: true)
      const defaultColor = colors.find((c) => c.isDefault);
      return defaultColor || colors[0] || DEFAULT_HYUNDAI_COLORS[0];
    },
    [versions]
  );

  // State cục bộ
  const [selectedVersion, setSelectedVersion] = useState<CarDetailVersion>(() =>
    findVersion(initialVersionSlug)
  );

  const [selectedColor, setSelectedColor] = useState<VersionColor | null>(() =>
    findColor(findVersion(initialVersionSlug), initialColorSlug)
  );

  const availableColors = useMemo(() => {
    if (selectedVersion?.colors && selectedVersion.colors.length > 0) {
      return selectedVersion.colors;
    }
    const anyVersionColors = versions.find((v) => v.colors && v.colors.length > 0)?.colors;
    if (anyVersionColors && anyVersionColors.length > 0) {
      return anyVersionColors;
    }
    return DEFAULT_HYUNDAI_COLORS;
  }, [selectedVersion, versions]);

  // Cập nhật URL Query bằng replaceState mà không gây reload
  const updateUrl = useCallback(
    (versionSlug: string, colorSlug?: string | null) => {
      if (typeof window === 'undefined') return;

      const url = new URL(window.location.href);
      if (versionSlug) {
        url.searchParams.set('phien-ban', versionSlug);
      } else {
        url.searchParams.delete('phien-ban');
      }

      if (colorSlug) {
        url.searchParams.set('mau', colorSlug);
      } else {
        url.searchParams.delete('mau');
      }

      window.history.replaceState({}, '', url.toString());
    },
    []
  );

  // Xử lý chuyển phiên bản
  const handleVersionChange = useCallback(
    (versionSlug: string) => {
      const targetVersion = versions.find((v) => v.slug === versionSlug);
      if (!targetVersion) return;

      setSelectedVersion(targetVersion);

      // Kiểm tra xem màu hiện tại có tồn tại trong phiên bản mới hay không
      const rawColors = targetVersion.colors || [];
      const nextColors = rawColors.length > 0 ? rawColors : DEFAULT_HYUNDAI_COLORS;
      let nextColor: VersionColor | null = null;

      if (selectedColor && nextColors.some((c) => c.colorId === selectedColor.colorId)) {
        nextColor = nextColors.find((c) => c.colorId === selectedColor.colorId) || null;
      } else {
        nextColor = nextColors.find((c) => c.isDefault) || nextColors[0] || DEFAULT_HYUNDAI_COLORS[0];
      }

      setSelectedColor(nextColor);
      updateUrl(targetVersion.slug, nextColor?.slug);
    },
    [versions, selectedColor, updateUrl]
  );

  // Xử lý đổi màu sơn
  const handleColorChange = useCallback(
    (colorSlug: string) => {
      const targetColor = availableColors.find((c) => c.slug === colorSlug);
      if (!targetColor) return;

      setSelectedColor(targetColor);
      updateUrl(selectedVersion.slug, targetColor.slug);
    },
    [availableColors, selectedVersion.slug, updateUrl]
  );

  // Lắng nghe sự kiện Popstate (Nút Back / Forward của trình duyệt)
  useEffect(() => {
    const handlePopState = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const urlVersionSlug = searchParams.get('phien-ban');
      const urlColorSlug = searchParams.get('mau');

      const matchedVersion = findVersion(urlVersionSlug);
      setSelectedVersion(matchedVersion);

      const matchedColor = findColor(matchedVersion, urlColorSlug);
      setSelectedColor(matchedColor);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [findVersion, findColor]);

  // URL chia sẻ hiện tại
  const currentShareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return {
    selectedVersion,
    selectedColor,
    availableColors,
    handleVersionChange,
    handleColorChange,
    currentShareUrl,
  };
}

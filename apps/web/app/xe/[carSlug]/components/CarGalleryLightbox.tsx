'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Images,
  LayoutGrid,
  Layers,
  Sparkles,
  Eye,
} from 'lucide-react';
import { Modal, Button } from '@cardealer/ui';

interface CarGalleryLightboxProps {
  images: string[];
  carName: string;
}

/**
 * 🧠 Mental Model: Thư Viện Ảnh Thực Tế Xe & Trình Chiếu Lightbox Cao Cấp (CarGalleryLightbox).
 * - Chế độ "Trình chiếu" (Showcase Mode - Mặc định): Sân khấu ảnh lớn 16:10 siêu nét + Dải thumbnail
 *   tương tác cân đối 100% bên dưới, loại bỏ hoàn toàn khoảng trống khuyết góc khi có 6 ảnh.
 * - Chế độ "Lưới ảnh" (Grid Mode): Lưới 3 cột x 2 hàng đối xứng tuyệt đối cho 6 ảnh, hoặc bento động.
 * - Lightbox Modal chuẩn VIP: Header kính mờ, dải thumbnail mini ở đáy modal để nhảy nhanh đến ảnh bất kỳ.
 * - Hỗ trợ đầy đủ phím tắt bàn phím (Mũi tên ← →, Escape) và tương thích touch mobile.
 */
export function CarGalleryLightbox({ images, carName }: CarGalleryLightboxProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [activeShowcaseIndex, setActiveShowcaseIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'showcase' | 'grid'>('showcase');

  const isOpen = selectedIndex !== null;

  // Đảm bảo index hợp lệ khi danh sách ảnh thay đổi
  useEffect(() => {
    setActiveShowcaseIndex(0);
  }, [images]);

  const handleOpen = (index: number) => {
    setSelectedIndex(index);
  };

  const handleClose = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const handlePrev = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => ((prev ?? 0) > 0 ? (prev ?? 0) - 1 : images.length - 1));
  }, [selectedIndex, images.length]);

  const handleNext = useCallback(() => {
    if (selectedIndex === null) return;
    setSelectedIndex((prev) => ((prev ?? 0) < images.length - 1 ? (prev ?? 0) + 1 : 0));
  }, [selectedIndex, images.length]);

  const handleShowcasePrev = useCallback(() => {
    setActiveShowcaseIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  }, [images.length]);

  const handleShowcaseNext = useCallback(() => {
    setActiveShowcaseIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  }, [images.length]);

  // Điều khiển phím bấm bàn phím trong Modal Lightbox
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose, handlePrev, handleNext]);

  if (!images || images.length === 0) {
    return null;
  }

  // Quyết định số cột trong Grid mode để không bao giờ bị khuyết góc (ví dụ 6 ảnh -> 3 cột x 2 hàng)
  const getGridColsClass = () => {
    if (images.length === 1) return 'grid-cols-1';
    if (images.length === 2) return 'grid-cols-2';
    if (images.length === 3) return 'grid-cols-1 sm:grid-cols-3';
    if (images.length === 4) return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-4';
    if (images.length === 6) return 'grid-cols-2 sm:grid-cols-3'; // 3 cột x 2 hàng cân đối 100%
    return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4';
  };

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 space-y-5 sm:space-y-6 shadow-sm">
      {/* 📸 Header Bar: Tiêu đề, số lượng ảnh & Bộ chuyển đổi chế độ xem */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 border-b border-slate-100 pb-4.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <Images className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                Thư Viện Ảnh Thực Tế
              </h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                {images.length} Ảnh
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Chi tiết không gian nội ngoại thất xe {carName} tại showroom
            </p>
          </div>
        </div>

        {/* Nút chuyển chế độ xem (Trình chiếu vs Lưới) & Xem tất cả */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewMode('showcase')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'showcase'
                  ? 'bg-white text-blue-600 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Chế độ Trình chiếu ảnh lớn nổi bật"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Trình chiếu</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-blue-600 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Chế độ Lưới ảnh đồng đều"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Lưới ảnh</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleOpen(activeShowcaseIndex)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 h-8 text-xs font-bold text-slate-700 bg-white hover:bg-blue-50 hover:text-blue-600 rounded-xl border border-slate-200 hover:border-blue-300 transition-all cursor-pointer shadow-xs"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Phóng to toàn cảnh</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          CHẾ ĐỘ 1: TRÌNH CHIẾU NỔI BẬT (SHOWCASE STAGE + DẢI THUMBNAIL) - MẶC ĐỊNH
      ========================================================================= */}
      {viewMode === 'showcase' && (
        <div className="space-y-3.5">
          {/* 🌟 Sân khấu ảnh chính (Main Stage) */}
          <div
            onClick={() => handleOpen(activeShowcaseIndex)}
            className="group relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[500px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-200/90 shadow-sm cursor-pointer select-none"
          >
            <Image
              src={images[activeShowcaseIndex]}
              alt={`${carName} - Ảnh thực tế ${activeShowcaseIndex + 1}`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 850px"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.015]"
            />

            {/* Badge vị trí ảnh nổi ở góc trên trái */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/75 backdrop-blur-md text-white text-xs font-bold border border-white/10 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Ảnh {activeShowcaseIndex + 1} / {images.length}</span>
            </div>

            {/* Hint & Nút Phóng to ở góc dưới phải */}
            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-10 flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/75 backdrop-blur-md text-white text-xs font-medium border border-white/10 opacity-90 group-hover:opacity-100 transition-opacity">
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                <span>Bấm để phóng to HD</span>
              </span>
              <span className="p-2.5 rounded-xl bg-slate-950/80 backdrop-blur-md text-white border border-white/15 shadow-sm group-hover:bg-blue-600 group-hover:scale-105 transition-all">
                <Maximize2 className="w-4 h-4" />
              </span>
            </div>

            {/* Nút lùi / tiến ảnh ngay trên Sân khấu */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowcasePrev();
                  }}
                  className="absolute left-2 sm:left-3.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-950/60 hover:bg-blue-600 text-white flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg transition-all active:scale-90 cursor-pointer"
                  aria-label="Ảnh trước đó"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShowcaseNext();
                  }}
                  className="absolute right-2 sm:right-3.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-950/60 hover:bg-blue-600 text-white flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg transition-all active:scale-90 cursor-pointer"
                  aria-label="Ảnh tiếp theo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* 🎞️ Dải Thumbnails bên dưới: Chia đều tỉ lệ, không để khoảng trống thừa */}
          <div
            className={`grid gap-2 sm:gap-2.5 ${
              images.length === 6
                ? 'grid-cols-3 sm:grid-cols-6'
                : images.length <= 5
                ? `grid-cols-${images.length}`
                : 'grid-cols-3 sm:grid-cols-4 md:grid-cols-6'
            }`}
          >
            {images.map((imgUrl, idx) => {
              const isActive = activeShowcaseIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveShowcaseIndex(idx)}
                  className={`group relative aspect-[16/10] sm:aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 transition-all cursor-pointer border ${
                    isActive
                      ? 'ring-2 ring-blue-600 border-blue-600 shadow-md scale-[1.02] opacity-100'
                      : 'border-slate-200/90 hover:border-blue-400 opacity-60 hover:opacity-100'
                  }`}
                  aria-label={`Xem ảnh số ${idx + 1}`}
                >
                  <Image
                    src={imgUrl}
                    alt={`${carName} - Thu nhỏ ${idx + 1}`}
                    fill
                    sizes="(max-width: 640px) 33vw, 150px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {isActive && (
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-blue-600 text-white text-[9px] font-mono font-bold leading-none shadow-xs">
                      {idx + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          CHẾ ĐỘ 2: LƯỚI ẢNH ĐỒNG ĐỀU (GRID BENTO MODE) - 3 CỘT X 2 HÀNG CÂN XỨNG
      ========================================================================= */}
      {viewMode === 'grid' && (
        <div className={`grid ${getGridColsClass()} gap-3 sm:gap-4`}>
          {images.map((imgUrl, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleOpen(index)}
              className="group relative aspect-[16/10] sm:aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/90 hover:border-blue-500 shadow-xs hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer transition-all duration-300"
            >
              <Image
                src={imgUrl}
                alt={`${carName} - Ảnh chi tiết ${index + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Tag số thứ tự ảnh */}
              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-mono font-bold">
                {index + 1}/{images.length}
              </div>

              {/* Overlay hover */}
              <div className="absolute inset-0 bg-slate-950/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <span className="p-2.5 rounded-xl bg-slate-900/80 backdrop-blur-xs shadow-md transform scale-90 group-hover:scale-100 transition-transform">
                  <Maximize2 className="w-4 h-4" />
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* =========================================================================
          MODAL LIGHTBOX FULLSCREEN: GIAO DIỆN XEM ẢNH CAO CẤP + THUMBNAIL RAIL
      ========================================================================= */}
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        variant="dark"
        showCloseButton={false}
        className="max-w-6xl w-full border-0 bg-transparent p-0 shadow-none flex flex-col items-center justify-center relative select-none"
      >
        {selectedIndex !== null && (
          <div className="w-full flex flex-col items-center">
            {/* Header thanh công cụ nổi */}
            <div className="w-full flex items-center justify-between px-3 sm:px-6 py-2.5 mb-2 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-white/10 text-white">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-slate-100">
                  {carName}
                </span>
                <span className="text-slate-500">•</span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-600/80 text-[11px] font-mono font-bold">
                  {selectedIndex + 1} / {images.length}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden md:inline text-xs text-slate-400">
                  Phím ← → để chuyển • Esc để đóng
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                  aria-label="Đóng xem ảnh"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Vùng Ảnh Chính Phóng To */}
            <div
              className="relative w-full aspect-[16/10] max-h-[70vh] sm:max-h-[72vh] rounded-2xl overflow-hidden bg-black/40 flex items-center justify-center border border-white/5"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[selectedIndex]}
                alt={`${carName} - Phóng to ảnh ${selectedIndex + 1}`}
                fill
                priority
                sizes="100vw"
                className="object-contain"
              />

              {/* Nút Lùi Ảnh */}
              {images.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-blue-600 text-white shadow-xl backdrop-blur-md active:scale-95 cursor-pointer border border-white/10"
                  aria-label="Ảnh trước đó"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
              )}

              {/* Nút Tiếp Ảnh */}
              {images.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/60 hover:bg-blue-600 text-white shadow-xl backdrop-blur-md active:scale-95 cursor-pointer border border-white/10"
                  aria-label="Ảnh tiếp theo"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              )}
            </div>

            {/* 🎞️ Dải Thumbnail Rail ở đáy Modal: Click để nhảy ngay tới ảnh bất kỳ */}
            {images.length > 1 && (
              <div
                className="w-full max-w-4xl px-2 mt-3.5 flex items-center justify-center gap-2 overflow-x-auto py-1 scrollbar-none"
                onClick={(e) => e.stopPropagation()}
              >
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSelectedIndex(i)}
                    className={`relative w-14 h-9 sm:w-16 sm:h-10 rounded-lg overflow-hidden shrink-0 transition-all cursor-pointer ${
                      selectedIndex === i
                        ? 'ring-2 ring-blue-500 scale-105 opacity-100 shadow-md'
                        : 'opacity-40 hover:opacity-80 border border-white/10'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumb ${i + 1}`}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

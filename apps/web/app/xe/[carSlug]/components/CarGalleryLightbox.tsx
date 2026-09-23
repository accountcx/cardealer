'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Maximize2, Images } from 'lucide-react';
import { Modal, Button } from '@cardealer/ui';

interface CarGalleryLightboxProps {
  images: string[];
  carName: string;
}

/**
 * 🧠 Mental Model: Thư viện ảnh xe & Trình phóng to toàn màn hình (CarGalleryLightbox).
 * - Sử dụng Modal & Button dùng chung từ @cardealer/ui để bảo đảm nhất quán trải nghiệm,
 *   tự động khóa cuộn trang (body lock) và tuân thủ chuẩn trợ năng WCAG AAA.
 * - Hỗ trợ tương tác cao cấp: Phím mũi tên Trái/Phải, Escape để đóng, Next/Prev.
 */
export function CarGalleryLightbox({ images, carName }: CarGalleryLightboxProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const isOpen = selectedIndex !== null;

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

  // Điều khiển phím bấm bàn phím (Mũi tên Trái / Phải)
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

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Images className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Thư Viện Ảnh Thực Tế
            </h2>
            <p className="text-xs text-slate-500">
              Chi tiết không gian nội ngoại thất xe {carName} ({images.length} hình ảnh)
            </p>
          </div>
        </div>
      </div>

      {/* Grid Thumbnail Thư Viện Ảnh */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {images.map((imgUrl, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleOpen(index)}
            className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
          >
            <Image
              src={imgUrl}
              alt={`${carName} - Ảnh chi tiết ${index + 1}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
            />
            {/* Overlay icon hover */}
            <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <span className="p-2 rounded-full bg-slate-900/60 backdrop-blur-xs">
                <Maximize2 className="w-4 h-4" />
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Modal Lightbox Tái Sử Dụng Primitive Modal & Button từ @cardealer/ui */}
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        variant="dark"
        showCloseButton={false}
        className="max-w-6xl w-full border-0 bg-transparent p-0 shadow-none flex flex-col items-center justify-center relative select-none"
      >
        {selectedIndex !== null && (
          <>
            {/* Bộ đếm vị trí ảnh */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-50 px-4 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-bold tracking-wider">
              {selectedIndex + 1} / {images.length}
            </div>

            {/* Nút Đóng */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="absolute -top-12 right-0 z-50 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white"
              aria-label="Đóng xem ảnh"
            >
              <X className="w-5 h-5" />
            </Button>

            {/* Vùng Ảnh Chính */}
            <div
              className="relative w-full aspect-[16/10] max-h-[75vh] flex items-center justify-center"
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
            </div>

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
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white shadow-lg active:scale-95"
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
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white shadow-lg active:scale-95"
                aria-label="Ảnh tiếp theo"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import type { CarDetail } from '@cardealer/types';
import { formatVND, formatVNDShort } from '@cardealer/core';
import { useCarDetailUrlSync } from '../hooks/use-car-detail-url-sync';
import { useImagePreloader } from '../hooks/use-image-preloader';
import { CarHeroExperience } from './CarHeroExperience';
import { VersionSelector } from './VersionSelector';
import { SalerQuickShareBar } from './SalerQuickShareBar';
import { DynamicSpecsTable } from './DynamicSpecsTable';
import { CarGalleryLightbox } from './CarGalleryLightbox';
import { CarReviewWithTOC } from './CarReviewWithTOC';
import { ConsultantTrustCard } from './ConsultantTrustCard';
import { QuickLoanTeaser } from './QuickLoanTeaser';
import { generateZaloDeepLink } from '../../../../lib/zalo';
import { Button } from '@cardealer/ui';
import {
  ChevronRight,
  Home,
  MessageSquare,
  FileText,
  Calculator,
  Gift,
  PhoneCall,
  Sparkles,
} from 'lucide-react';

export interface ConsultantInfo {
  name: string;
  phone: string;
  hotline: string;
  zaloUrl?: string;
  avatar?: string;
  statusText?: string;
  showroomName: string;
  showroomAddress?: string;
}

interface CarDetailViewProps {
  car: CarDetail;
  initialVersionSlug?: string | null;
  initialColorSlug?: string | null;
  consultant?: ConsultantInfo;
}

const DEFAULT_CONSULTANT: ConsultantInfo = {
  name: '',
  phone: '',
  hotline: '',
  zaloUrl: '',
  avatar: '',
  statusText: '',
  showroomName: '',
  showroomAddress: '',
};

/**
 * 🧠 Mental Model: Root Client View điều phối toàn bộ trải nghiệm tương tác trên trang chi tiết xe (/xe/[carSlug]).
 * - Quản lý URL query 2 chiều (?phien-ban=...&mau=...) qua Hook useCarDetailUrlSync.
 * - Tự động nạp trước ảnh màu vào RAM cache qua Hook useImagePreloader.
 * - Tích hợp đầy đủ các khối công cụ bán hàng cá nhân của Saler:
 *   + Smart Zalo CTA tự soạn tin nhắn ngữ cảnh xe + màu sơn.
 *   + Nút Sao chép cấu hình xe gửi khách.
 *   + Bảng thông số kỹ thuật động có lọc điểm khác biệt.
 *   + Thư viện ảnh thực tế & Lightbox phóng to.
 *   + Thẻ cam kết niềm tin cá nhân của Saler.
 *   + Thanh chốt đơn dính đáy mobile và sub-header desktop.
 */
export function CarDetailView({
  car,
  initialVersionSlug,
  initialColorSlug,
  consultant = DEFAULT_CONSULTANT,
}: CarDetailViewProps) {
  // Hook đồng bộ URL 2 chiều
  const {
    selectedVersion,
    selectedColor,
    availableColors,
    handleVersionChange,
    handleColorChange,
  } = useCarDetailUrlSync({
    car,
    initialVersionSlug,
    initialColorSlug,
  });

  // Background Preloading toàn bộ ảnh màu của phiên bản hiện tại vào RAM
  const colorImageUrls = useMemo(
    () => availableColors.map((c) => c.anhXeTheoMauUrl),
    [availableColors]
  );
  useImagePreloader(colorImageUrls);

  // Dữ liệu giá hiển thị của phiên bản đang chọn
  const activePrice = selectedVersion?.giaKhuyenMai || selectedVersion?.giaNiemYet || car.minPrice;
  const hasDiscount = Boolean(
    selectedVersion?.giaKhuyenMai &&
      selectedVersion?.giaNiemYet &&
      selectedVersion.giaKhuyenMai < selectedVersion.giaNiemYet
  );

  // Zalo Deep Link tự soạn tin nhắn
  const zaloUrl = useMemo(
    () =>
      generateZaloDeepLink({
        hotline: consultant.hotline,
        salerName: consultant.name,
        carName: car.tenXe,
        versionName: selectedVersion?.tenPhienBan || '',
        colorName: selectedColor?.tenMau,
      }),
    [consultant.hotline, consultant.name, car.tenXe, selectedVersion?.tenPhienBan, selectedColor?.tenMau]
  );

  // URL bảng tính trả góp ngân hàng
  const installmentUrl = `/gia-lan-banh?tab=tra-gop&xe=${car.slug}&phien-ban=${selectedVersion?.slug || ''}`;

  // Kiểm tra xem dòng xe có dữ liệu thông số kỹ thuật (specGroups) hay không
  const hasSpecs = Boolean(car.versions?.some((v) => v.specGroups && v.specGroups.length > 0));

  // Thư viện ảnh gom từ phiên bản hoặc từ car
  const galleryImages = useMemo(() => {
    if (selectedVersion?.boSuuTapAnh && selectedVersion.boSuuTapAnh.length > 0) {
      return selectedVersion.boSuuTapAnh;
    }
    const versionImages = (car.versions || []).flatMap((v) => v.boSuuTapAnh || []);
    if (versionImages.length > 0) {
      return Array.from(new Set(versionImages));
    }
    return [car.anhDaiDienUrl];
  }, [selectedVersion, car]);

  const cleanPhone = consultant.hotline.replace(/\D/g, '');

  // 🧠 Mental Model: Anchor Scroll mượt mà xuống khối tính trả góp trực quan ngay trên trang.
  // Giữ chân khách hàng trên trang, bảo toàn 100% màu sơn và phiên bản đã chọn, tránh làm đứt gãy trải nghiệm.
  const handleScrollToInstallment = () => {
    const element = document.getElementById('du-toan-tra-gop');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      element.classList.add('ring-4', 'ring-blue-500/40', 'rounded-3xl');
      setTimeout(() => {
        element.classList.remove('ring-4', 'ring-blue-500/40');
      }, 1500);
    }
  };

  // 🔄 Tự động đồng bộ tên xe, phiên bản và giá thực tế vào ProductStickyBar toàn cục của RootLayout
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const title = `${car.tenXe} ${selectedVersion?.tenPhienBan || ''}`.trim();
      const downPayment = Math.round(activePrice * 0.15);
      window.dispatchEvent(
        new CustomEvent('update-sticky-bar', {
          detail: {
            carTitle: title,
            priceText: `${formatVNDShort(activePrice)} • Góp từ ${formatVNDShort(downPayment)}`,
          },
        })
      );
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('reset-sticky-bar'));
      }
    };
  }, [car.tenXe, selectedVersion?.tenPhienBan, activePrice]);

  // 📝 Mở Modal Báo Giá qua RootLayout ViewportCoordinator với đầy đủ thông tin dòng xe, phiên bản và màu sơn
  const handleOpenLeadModal = () => {
    if (typeof window !== 'undefined') {
      const fullCarTitle = `${car.tenXe} ${selectedVersion?.tenPhienBan || ''}${
        selectedColor?.tenMau ? ` (Màu ${selectedColor.tenMau})` : ''
      }`.trim();
      window.dispatchEvent(
        new CustomEvent('open-lead-modal', {
          detail: { carTitle: fullCarTitle },
        })
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-24 sm:pb-28">
      {/* 🧭 Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <ol className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto scrollbar-none py-1">
          <li className="flex items-center gap-1">
            <Link
              href="/"
              className="hover:text-blue-600 transition-colors inline-flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
          </li>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <li>
            <Link href="/xe" className="hover:text-blue-600 transition-colors whitespace-nowrap">
              Bảng giá xe
            </Link>
          </li>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <li className="font-bold text-slate-900 truncate" aria-current="page">
            {car.tenXe}
          </li>
        </ol>
      </nav>

      {/* 🚀 Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pt-2">
        {/* ========================================================================= */}
        {/* SECTION 1: HERO EXPERIENCE & PRICING GRID */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* CỘT TRÁI (7 cols): Studio Stage, Color Swatches, Quick Share */}
          <div className="lg:col-span-7 space-y-4">
            <CarHeroExperience
              carName={car.tenXe}
              versionName={selectedVersion?.tenPhienBan || ''}
              currentColor={selectedColor}
              fallbackImage={car.anhDaiDienUrl}
              availableColors={availableColors}
              onSelectColor={(color) => handleColorChange(color.slug)}
            />

            {/* Nút Sao Chép Cấu Hình Cho Saler & Khách */}
            <SalerQuickShareBar
              carName={car.tenXe}
              versionName={selectedVersion?.tenPhienBan || ''}
              colorName={selectedColor?.tenMau}
            />
          </div>

          {/* CỘT PHẢI (5 cols): Thông Tin Xe, Giá Niêm Yết, Bộ Chọn Phiên Bản & CTA */}
          <div className="lg:col-span-5 space-y-6">
            {/* Header thông tin xe */}
            <div className="space-y-2 border-b border-slate-200/80 pb-5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  Hyundai {car.segment.toUpperCase()}
                </span>
                {car.fuelType && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {car.fuelType}
                  </span>
                )}
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Sẵn xe giao ngay
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                {car.tenXe}
              </h1>

              {/* Khối giá tiền */}
              <div className="pt-2 flex items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
                  {formatVND(activePrice)}
                </span>
                {hasDiscount && (
                  <span className="text-sm sm:text-base text-slate-400 line-through">
                    {formatVND(selectedVersion?.giaNiemYet || 0)}
                  </span>
                )}
              </div>

              {/* Ưu đãi tóm tắt */}
              {car.promotionSummary && (
                <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 font-medium flex items-start gap-2">
                  <Gift className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Khuyến mãi đặc biệt:</strong> {car.promotionSummary}
                  </span>
                </div>
              )}
            </div>

            {/* Khối chọn phiên bản xe */}
            <VersionSelector
              versions={car.versions || []}
              selectedVersionId={selectedVersion?.id || ''}
              onSelectVersion={handleVersionChange}
              onScrollToInstallment={handleScrollToInstallment}
            />

            {/* Các nút Call-To-Action chính: Tối ưu theo Hick's Law (Gom còn 2 nút đối xứng 60/40) */}
            <div className="pt-2">
              <div className="flex items-center gap-2.5 sm:gap-3">
                {/* 1. Primary CTA: Nhận Báo Giá (Chiếm ~60% chiều ngang, màu đỏ nổi bật kích thích chuyển đổi) */}
                <Button
                  type="button"
                  size="lg"
                  leftIcon={<FileText className="w-4 h-4 shrink-0" />}
                  onClick={handleOpenLeadModal}
                  className="flex-[1.4] sm:flex-[1.5] h-12 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs sm:text-sm tracking-tight shadow-md shadow-rose-600/25 active:scale-[0.98] transition-all border-0"
                >
                  Nhận Báo Giá Lăn Bánh
                </Button>

                {/* 2. Secondary CTA: Chat Zalo (Chiếm ~40% chiều ngang, kênh liên hệ riêng tư được ưa chuộng nhất) */}
                <Button
                  asChild
                  size="lg"
                  className="flex-1 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm tracking-tight shadow-md shadow-emerald-600/25 active:scale-[0.98] transition-all border-0"
                >
                  <a
                    href={zaloUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    <span>Chat Zalo</span>
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SECTION 2: SPECS, GALLERY, REVIEW & CONSULTANT TRUST CARD */}
        {/* ========================================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-6">
          {/* CỘT TRÁI (8 cols): Specs Table, Media Gallery, Review with TOC */}
          <div className="lg:col-span-8 space-y-10">
            {/* Bảng thông số kỹ thuật có gạt xem khác biệt (chỉ hiển thị khi có dữ liệu) */}
            {hasSpecs && (
              <DynamicSpecsTable
                versions={car.versions || []}
                selectedVersionId={selectedVersion?.id || ''}
              />
            )}

            {/* Thư viện ảnh thực tế & Lightbox */}
            {galleryImages.length > 0 && (
              <CarGalleryLightbox images={galleryImages} carName={car.tenXe} />
            )}

            {/* Bài đánh giá chi tiết với Sticky TOC */}
            <CarReviewWithTOC
              carName={car.tenXe}
              generalDescription={car.moTaChung}
              reviewContent={selectedVersion?.reviewContent}
            />
          </div>

          {/* CỘT PHẢI (4 cols): Consultant Trust Card & Quick Loan Teaser */}
          <div className="lg:col-span-4 space-y-8 sticky top-20">
            {/* Thẻ thương hiệu cá nhân của Saler với 5 cam kết vàng */}
            <ConsultantTrustCard
              salerName={consultant.name}
              hotline={consultant.hotline}
              zaloUrl={zaloUrl}
              avatar={consultant.avatar}
              carName={car.tenXe}
              versionName={selectedVersion?.tenPhienBan || ''}
              colorName={selectedColor?.tenMau}
              onOpenLeadModal={handleOpenLeadModal}
            />

            {/* Widget tính trả góp nhanh (đích đến của thao tác cuộn Anchor Scroll) */}
            <div id="du-toan-tra-gop" className="scroll-mt-24 transition-all duration-300">
              <QuickLoanTeaser
                carPrice={activePrice}
                carSlug={car.slug}
                versionSlug={selectedVersion?.slug || ''}
                carName={car.tenXe}
                versionName={selectedVersion?.tenPhienBan || ''}
                calculatorUrl={installmentUrl}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

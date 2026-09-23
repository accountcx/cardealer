'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, DollarSign, Car, ChevronRight, Calculator } from 'lucide-react';
import {
  Card,
  Badge,
  Button,
  ChipGroup,
  type ChipOption,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  useForm,
} from '@cardealer/ui';
import type { LeadFilterConfig, PriceRangeItem, BodyStyleItem } from '@cardealer/types';
import { useHomeFilter } from './HomeFilterContext';

export interface LeadMagnetFilterProps {
  config: LeadFilterConfig;
  totalCars?: number;
}

export interface LeadFilterFormValues {
  budget: string;
  segment: string;
}

// 🧠 Mental Model: Helper rút gọn nhãn ngân sách chuẩn Responsive Microcopy cho Mobile.
// Ví dụ: "Dưới 500 triệu" -> "< 500tr", "500 - 800 triệu" -> "500 - 800tr", "Trên 800 triệu" -> "> 800tr".
function getShortPriceLabel(pr: PriceRangeItem): string {
  if (pr.min === null || pr.min === undefined) {
    if (pr.max) return `< ${(pr.max / 1_000_000).toLocaleString('vi-VN')}tr`;
  }
  if (pr.max === null || pr.max === undefined) {
    if (pr.min) return `> ${(pr.min / 1_000_000).toLocaleString('vi-VN')}tr`;
  }
  if (pr.min && pr.max) {
    return `${pr.min / 1_000_000} - ${pr.max / 1_000_000}tr`;
  }
  return pr.label
    .replace(/Dưới\s+/i, '< ')
    .replace(/Trên\s+/i, '> ')
    .replace(/\s*triệu/gi, 'tr')
    .replace(/\s*tỷ/gi, ' tỷ');
}

// 🧠 Mental Model: Helper rút gọn nhãn kiểu dáng chuẩn Responsive Microcopy cho Mobile.
// Ví dụ: "Sedan Đô Thị" -> "Sedan", "SUV Gầm Cao" -> "SUV", "MPV 7 Chỗ" -> "MPV".
function getShortBodyStyleLabel(bs: BodyStyleItem): string {
  const normalized = bs.label.trim();
  const firstWord = normalized.split(/\s+/)[0];
  if (['sedan', 'suv', 'mpv', 'hatchback', 'crossover', 'ev'].includes(firstWord.toLowerCase())) {
    return firstWord.toUpperCase() === 'EV' ? 'EV' : firstWord;
  }
  if (['sedan', 'suv', 'mpv', 'hatchback', 'ev'].includes(bs.segment.toLowerCase())) {
    return bs.segment.toUpperCase();
  }
  return normalized.length > 9 ? normalized.slice(0, 9) : normalized;
}

// 🧠 Mental Model: Phân khu 2 - Lead Magnet Hub (Bộ Lọc Nhanh).
// Chuẩn thiết kế Showroom Hyundai sang trọng, tối ưu tỷ lệ thị giác trên cả Desktop, Tablet và Mobile:
// 1. Tận dụng 100% Shared UI Components (@cardealer/ui): Card, Badge, Button, ChipGroup, Form, FormField.
// 2. Tích hợp react-hook-form: Quản trị form state chặt chẽ, hỗ trợ Controller và validation mở rộng.
// 3. Mobile First: Tổng chiều cao card <= 210px, header 1 hàng rút gọn, ChipGroup cuộn ngang cảm ứng kèm gradient fade.
// 4. Responsive Microcopy: Tự động chuyển đổi nhãn nút ("Tất cả", "< 500tr", "Sedan") ở mobile và đầy đủ ở desktop.
// 5. Tích hợp Filter Engine: Lọc dữ liệu tức thì ở danh sách xe bên dưới không cần reload trang.
// 6. Cầu nối sang Tool: Bổ sung liên kết tính giá lăn bánh trực tiếp truyền sẵn query params.
export const LeadMagnetFilter: React.FC<LeadMagnetFilterProps> = ({ config, totalCars = 8 }) => {
  const router = useRouter();
  const filterContext = useHomeFilter();

  // Local state fallback nếu không được bọc bởi HomeFilterProvider
  const [localPrice, setLocalPrice] = useState<string>('all');
  const [localSegment, setLocalSegment] = useState<string>('all');

  const selectedPrice = filterContext ? filterContext.selectedPrice : localPrice;
  const selectedSegment = filterContext ? filterContext.selectedSegment : localSegment;
  const matchingCount = filterContext ? filterContext.matchingCount : totalCars;

  // Khởi tạo React Hook Form
  const form = useForm<LeadFilterFormValues>({
    defaultValues: {
      budget: selectedPrice,
      segment: selectedSegment,
    },
  });

  // Đồng bộ giá trị từ FilterContext/URL vào React Hook Form khi có thay đổi ngoại vi
  useEffect(() => {
    if (selectedPrice !== form.getValues('budget')) {
      form.setValue('budget', selectedPrice);
    }
  }, [selectedPrice, form]);

  useEffect(() => {
    if (selectedSegment !== form.getValues('segment')) {
      form.setValue('segment', selectedSegment);
    }
  }, [selectedSegment, form]);

  // Chuẩn hóa danh sách options Mức Ngân Sách cho ChipGroup
  const budgetOptions: ChipOption[] = useMemo(() => {
    return [
      {
        id: 'all',
        label: 'Tất Cả Mức Giá',
        shortLabel: 'Tất cả',
      },
      ...config.priceRanges.map((pr) => ({
        id: pr.id,
        label: pr.label,
        shortLabel: getShortPriceLabel(pr),
      })),
    ];
  }, [config.priceRanges]);

  // Chuẩn hóa danh sách options Kiểu Dáng Xe cho ChipGroup:
  // Đảm bảo đủ các phân khúc (Sedan, SUV, MPV, Hatchback, Xe Điện) để lấp đầy hàng nút, cuộn ngang mượt mà tự nhiên
  const segmentOptions: ChipOption[] = useMemo(() => {
    const baseList = config.bodyStyles && config.bodyStyles.length > 0 ? config.bodyStyles : [];
    const hasHatchback = baseList.some((b) => b.segment === 'hatchback');
    const hasEv = baseList.some((b) => b.segment === 'ev');

    const extendedList = [...baseList];
    if (!hasHatchback) {
      extendedList.push({ id: 'hatchback', label: 'Hatchback', segment: 'hatchback' });
    }
    if (!hasEv) {
      extendedList.push({ id: 'ev', label: 'Xe Điện (EV)', segment: 'ev' });
    }

    return [
      {
        id: 'all',
        label: 'Tất Cả Kiểu Dáng',
        shortLabel: 'Tất cả',
      },
      ...extendedList.map((bs) => ({
        id: bs.segment,
        label: bs.label,
        shortLabel: getShortBodyStyleLabel(bs),
      })),
    ];
  }, [config.bodyStyles]);

  if (!config || !config.enabled) return null;

  const handleSelectPrice = (id: string) => {
    if (filterContext) {
      filterContext.setPrice(id);
    } else {
      setLocalPrice(id);
    }
  };

  const handleSelectSegment = (segment: string) => {
    if (filterContext) {
      filterContext.setSegment(segment);
    } else {
      setLocalSegment(segment);
    }
  };

  const onSubmit = (data: LeadFilterFormValues) => {
    const featuredElem = document.getElementById('featured-cars');
    if (featuredElem) {
      featuredElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      const params = new URLSearchParams();
      if (data.budget !== 'all') params.set('price', data.budget);
      if (data.segment !== 'all') params.set('segment', data.segment);
      const queryString = params.toString();
      router.push(queryString ? `/xe?${queryString}` : '/xe');
    }
  };

  // URL Cầu nối trực tiếp sang công cụ tính giá lăn bánh theo tiêu chí đang chọn
  const buildCalculatorUrl = () => {
    const params = new URLSearchParams();
    if (selectedSegment !== 'all') params.set('segment', selectedSegment);
    if (selectedPrice !== 'all') params.set('budget', selectedPrice);
    const qs = params.toString();
    return qs ? `/gia-lan-banh?${qs}` : '/gia-lan-banh';
  };

  return (
    <section className="relative -mt-6 sm:-mt-8 z-20 max-w-6xl mx-auto px-3 sm:px-6 mb-4 sm:mb-6">
      <Card
        variant="glow"
        className="bg-slate-900/95 backdrop-blur-xl border-slate-800 rounded-2xl sm:rounded-3xl py-2.5 px-3 sm:p-6 shadow-2xl shadow-black/50"
      >
        {/* ================= 1. HEADER & BADGE ================= */}
        {/* Mobile Header: Gộp tiêu đề rút gọn và badge nhỏ vào chung 1 hàng duy nhất */}
        <div className="flex sm:hidden items-center justify-between gap-2 mb-2">
          <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-[#0072CE]" />
            <span>Tìm Nhanh Xe</span>
          </h2>
          <Badge
            variant="accent"
            size="sm"
            className="text-[10px] font-bold tracking-tight whitespace-nowrap px-2 py-0.5"
          >
            {matchingCount > 0 ? `${matchingCount} Xe Sẵn` : 'Đang Tìm'}
          </Badge>
        </div>

        {/* Desktop/Tablet Header: Tiêu đề đầy đủ + Badge góc phải + Mô tả phụ */}
        <div className="hidden sm:flex items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800/80">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Search className="w-4 sm:w-5 h-4 sm:h-5 text-[#0072CE]" />
              <span>{config.headline}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Chọn mức ngân sách và kiểu dáng yêu thích để tìm ngay dòng xe phù hợp với gia đình bạn.
            </p>
          </div>
          <Badge
            variant="accent"
            size="default"
            className="text-xs font-bold tracking-wide whitespace-nowrap px-3.5 py-1.5"
          >
            {matchingCount > 0 ? `${matchingCount} Dòng Xe Có Sẵn` : '0 Xe Phù Hợp'}
          </Badge>
        </div>

        {/* ================= 2. REACT HOOK FORM & CHIPGROUPS ================= */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2 sm:space-y-5">
            {/* Hàng 1: Mức Ngân Sách */}
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem className="space-y-1 sm:space-y-2">
                  <FormLabel className="text-[11px] sm:text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1 cursor-default">
                    <DollarSign className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                    <span className="sm:hidden">NGÂN SÁCH</span>
                    <span className="hidden sm:inline">1. Mức Ngân Sách Đầu Tư</span>
                  </FormLabel>

                  <FormControl>
                    <ChipGroup
                      options={budgetOptions}
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val);
                        handleSelectPrice(val);
                      }}
                      gridCols={4}
                      scrollableOnMobile
                      showEdgeGradient
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Hàng 2: Kiểu Dáng Xe */}
            <FormField
              control={form.control}
              name="segment"
              render={({ field }) => (
                <FormItem className="space-y-1 sm:space-y-2">
                  <FormLabel className="text-[11px] sm:text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1 cursor-default">
                    <Car className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                    <span className="sm:hidden">KIỂU DÁNG</span>
                    <span className="hidden sm:inline">2. Kiểu Dáng Xe / Phân Khúc</span>
                  </FormLabel>

                  <FormControl>
                    <ChipGroup
                      options={segmentOptions}
                      value={field.value}
                      onChange={(val) => {
                        field.onChange(val);
                        handleSelectSegment(val);
                      }}
                      gridCols={4}
                      scrollableOnMobile
                      showEdgeGradient
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* ================= 3. PRIMARY CTA & ACTION STRIP TO CALCULATOR ================= */}
            {/* Mobile: 2 nút xếp chồng full-width (Thanh Action Strip lăn bánh trên + Nút Xem Xe dưới)
                Desktop: 2 nút đặt ngang hàng căn phải (Nút Outline phụ + Nút Accent chính) */}
            <div className="pt-2 sm:pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2.5 sm:gap-3.5 w-full">
              {/* Cầu nối trực tiếp sang công cụ tính giá lăn bánh theo phân khúc đã chọn */}
              <Link
                href={buildCalculatorUrl()}
                className="w-full sm:w-auto h-10 sm:h-11 px-3.5 sm:px-4 rounded-xl border border-sky-500/40 hover:border-sky-400/80 bg-slate-850/90 hover:bg-slate-800 sm:bg-slate-900/90 sm:hover:bg-slate-850 text-white hover:text-amber-200 flex items-center justify-between sm:justify-center gap-2.5 transition-all group shadow-md shadow-sky-950/40 hover:shadow-sky-500/20 text-xs sm:text-sm font-semibold cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-400 flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/20 group-hover:scale-105 transition-transform">
                    <Calculator className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                  </div>
                  <span className="sm:hidden font-semibold text-slate-100 group-hover:text-amber-300 transition-colors">
                    Dự toán lăn bánh & Trả góp phân khúc này
                  </span>
                  <span className="hidden sm:inline font-semibold text-slate-100 group-hover:text-amber-300 transition-colors">
                    Dự toán lăn bánh phân khúc này
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-amber-400 transition-transform duration-200 group-hover:translate-x-1 shrink-0" />
              </Link>

              {/* Nút Xem Xe Phù Hợp */}
              <Button
                type="submit"
                variant="accent"
                glow={true}
                leftIcon={<Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                rightIcon={<ChevronRight className="hidden sm:inline w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />}
                className="h-10 sm:h-11 w-full sm:w-auto px-5 sm:px-8 rounded-xl font-bold text-xs sm:text-sm shadow-lg shadow-[#0072CE]/25 hover:shadow-[#0072CE]/40 transition-all active:scale-[0.99] group cursor-pointer border-0 shrink-0"
              >
                <span className="sm:hidden">
                  {matchingCount > 0 ? `Xem ${matchingCount} Dòng Xe Phù Hợp →` : 'Xem Tất Cả Dòng Xe →'}
                </span>
                <span className="hidden sm:inline">
                  {matchingCount > 0 ? `Xem ${matchingCount} Dòng Xe Phù Hợp` : 'Xem Tất Cả Dòng Xe'}
                </span>
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </section>
  );
};

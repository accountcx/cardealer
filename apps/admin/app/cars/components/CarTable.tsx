import React, { useState } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Sparkles, Car as CarIcon } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Badge,
  Button,
  Skeleton,
} from '@cardealer/ui';

// 🧠 Mental Model: Hiển thị bảng dữ liệu danh sách xe Hyundai.
// Thiết kế chuẩn xe sang, bo góc mượt, badge trạng thái phát sáng và hỗ trợ Image Error Fallback.
// Cột Trạng Thái là nút Toggle tương tác tức thì (Đang Bán <-> Bản Nháp / Ẩn).
// Toàn bộ các cột quan trọng được gắn whitespace-nowrap để tuyệt đối không bị ngắt dòng gây vỡ giao diện.
// Tích hợp Realistic Skeleton Rows khi isLoading=true để chống nhảy giật layout (CLS).

export interface CarItem {
  id: string;
  tenXe: string;
  slug: string;
  anhDaiDienUrl: string;
  segment: string;
  traTruocTu?: number;
  promotionSummary?: string;
  minPrice: number;
  maxPrice: number;
  versionCount: number;
  status: 'published' | 'draft';
  isFeatured: boolean;
}

interface CarTableProps {
  cars: CarItem[];
  onDelete: (id: string) => void;
  onToggleStatus?: (car: CarItem) => void | Promise<void>;
  isLoading?: boolean;
}

function CarThumbnail({ src, alt }: { src: string; alt: string }) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className="w-14 h-10 rounded-xl bg-gradient-to-br from-slate-800/90 to-slate-900 border border-white/10 flex items-center justify-center text-slate-400 shrink-0 shadow-inner">
        <CarIcon size={18} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className="w-14 h-10 object-cover rounded-xl bg-slate-800 border border-white/10 shadow-sm shrink-0"
    />
  );
}

export function CarTable({ cars, onDelete, onToggleStatus, isLoading = false }: CarTableProps) {
  const formatPrice = (p?: number) => {
    if (!p) return 'Liên hệ';
    return (p / 1_000_000).toLocaleString('vi-VN') + ' tr';
  };

  const segmentLabels: Record<string, string> = {
    suv: 'SUV / Crossover',
    sedan: 'Sedan',
    hatchback: 'Hatchback',
    mpv: 'MPV Gia Đình',
    ev: 'Xe Điện Thông Minh',
  };

  if (!isLoading && cars.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p className="text-sm font-medium">Không tìm thấy dòng xe nào phù hợp.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow isHeader className="bg-slate-900/90 border-b border-white/10">
          <TableHead className="py-2.5 pl-5 font-bold text-slate-300">
            Dòng Xe
          </TableHead>
          <TableHead className="py-2.5 px-3.5 font-bold text-slate-300 whitespace-nowrap">
            Phân Khúc
          </TableHead>
          <TableHead className="py-2.5 px-3.5 font-bold text-slate-300 whitespace-nowrap">
            Khoảng Giá Niêm Yết
          </TableHead>
          <TableHead className="py-2.5 px-3.5 font-bold text-slate-300 whitespace-nowrap">
            Trả Trước Từ
          </TableHead>
          <TableHead className="py-2.5 px-3.5 font-bold text-slate-300 whitespace-nowrap">
            Số Phiên Bản
          </TableHead>
          <TableHead className="py-2.5 px-3.5 font-bold text-slate-300 whitespace-nowrap">
            Trạng Thái
          </TableHead>
          <TableHead align="right" className="py-2.5 pr-5 font-bold text-slate-300 text-right whitespace-nowrap">
            Thao Tác
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map((idx) => (
            <TableRow key={idx} className="border-b border-white/5">
              {/* Cột 1: Dòng Xe Skeleton */}
              <TableCell className="py-2.5 pl-5 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-14 h-10 rounded-xl shrink-0" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-32 rounded" />
                    <Skeleton className="h-3 w-20 rounded" />
                  </div>
                </div>
              </TableCell>

              {/* Cột 2: Phân Khúc Skeleton */}
              <TableCell className="py-2.5 px-3.5 whitespace-nowrap">
                <Skeleton className="h-4 w-24 rounded" />
              </TableCell>

              {/* Cột 3: Khoảng Giá Niêm Yết Skeleton */}
              <TableCell className="py-2.5 px-3.5 whitespace-nowrap">
                <Skeleton className="h-4 w-28 rounded" />
              </TableCell>

              {/* Cột 4: Trả Trước Từ Skeleton */}
              <TableCell className="py-2.5 px-3.5 whitespace-nowrap">
                <Skeleton className="h-4 w-16 rounded" />
              </TableCell>

              {/* Cột 5: Số Phiên Bản Skeleton */}
              <TableCell className="py-2.5 px-3.5 whitespace-nowrap">
                <Skeleton className="h-5 w-20 rounded-md" />
              </TableCell>

              {/* Cột 6: Trạng Thái Skeleton */}
              <TableCell className="py-2.5 px-3.5 whitespace-nowrap">
                <Skeleton className="h-6 w-20 rounded-full" />
              </TableCell>

              {/* Cột 7: Thao Tác Skeleton */}
              <TableCell align="right" className="py-2.5 pr-5 text-right whitespace-nowrap">
                <div className="inline-flex items-center justify-end gap-1.5">
                  <Skeleton className="h-7 w-14 rounded-lg" />
                  <Skeleton className="h-7 w-8 rounded-lg" />
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          cars.map((car) => (
          <TableRow
            key={car.id}
            className="hover:bg-slate-800/40 border-b border-white/5 transition-colors group"
          >
            {/* Cột 1: Dòng Xe */}
            <TableCell className="py-2.5 pl-5 whitespace-nowrap">
              <div className="flex items-center gap-3">
                <CarThumbnail src={car.anhDaiDienUrl} alt={car.tenXe} />
                <div>
                  <div className="font-bold text-white flex items-center gap-2 text-sm leading-tight">
                    {car.tenXe}
                    {car.isFeatured && (
                      <Badge variant="danger" size="sm" className="font-bold whitespace-nowrap text-[10px] px-1.5 py-0">
                        <Sparkles size={9} className="mr-0.5 inline" /> Hot
                      </Badge>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">/{car.slug}</div>
                </div>
              </div>
            </TableCell>

            {/* Cột 2: Phân Khúc */}
            <TableCell className="py-2.5 px-3.5 text-slate-300 text-sm font-medium whitespace-nowrap">
              {segmentLabels[car.segment] || car.segment}
            </TableCell>

            {/* Cột 3: Khoảng Giá Niêm Yết */}
            <TableCell className="py-2.5 px-3.5 font-semibold text-white text-sm whitespace-nowrap">
              {formatPrice(car.minPrice)} - {formatPrice(car.maxPrice)}
            </TableCell>

            {/* Cột 4: Trả Trước Từ */}
            <TableCell className="py-2.5 px-3.5 text-[#0072CE] font-bold text-sm whitespace-nowrap">
              {car.traTruocTu ? formatPrice(car.traTruocTu) : 'Chưa nhập'}
            </TableCell>

            {/* Cột 5: Số Phiên Bản */}
            <TableCell className="py-2.5 px-3.5 whitespace-nowrap">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-800/90 border border-white/5 text-xs font-semibold text-slate-200 whitespace-nowrap">
                {car.versionCount} phiên bản
              </span>
            </TableCell>

            {/* Cột 6: Trạng Thái (Nút chuyển đổi nhanh) */}
            <TableCell className="py-2.5 px-3.5 whitespace-nowrap">
              {onToggleStatus ? (
                <button
                  type="button"
                  onClick={() => onToggleStatus(car)}
                  title={
                    car.status === 'published'
                      ? 'Đang mở bán — Nhấn để ẩn / chuyển sang Bản Nháp'
                      : 'Bản Nháp (Ẩn) — Nhấn để công khai mở bán trên Web'
                  }
                  className="group/status inline-flex items-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/40 rounded-full transition-transform active:scale-95 select-none"
                >
                  <Badge
                    variant={car.status === 'published' ? 'published' : 'draft'}
                    className="px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap group-hover/status:ring-2 group-hover/status:ring-white/20 transition-all shadow-sm"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full mr-1.5 inline-block ${
                        car.status === 'published' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                      }`}
                    />
                    {car.status === 'published' ? 'Đang Bán' : 'Bản Nháp'}
                  </Badge>
                </button>
              ) : (
                <Badge
                  variant={car.status === 'published' ? 'published' : 'draft'}
                  className="px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full mr-1.5 inline-block ${
                      car.status === 'published' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  {car.status === 'published' ? 'Đang Bán' : 'Bản Nháp'}
                </Badge>
              )}
            </TableCell>

            {/* Cột 7: Thao Tác */}
            <TableCell align="right" className="py-2.5 pr-5 text-right whitespace-nowrap">
              <div className="inline-flex items-center justify-end gap-1.5">
                <Link
                  href={`/cars/${car.id}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-white/10 transition-colors shadow-sm"
                >
                  <Edit size={12} />
                  <span>Sửa</span>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onDelete(car.id)}
                  aria-label="Xóa dòng xe"
                  className="px-2 py-1 shadow-sm"
                >
                  <Trash2 size={12} />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        )))}
      </TableBody>
    </Table>
  );
}

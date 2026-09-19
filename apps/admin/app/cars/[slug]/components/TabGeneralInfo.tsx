import React from 'react';
import { Input } from '@cardealer/ui';

// 🧠 Mental Model: Tab 1 - Thông tin cơ bản dòng xe.
// Quản lý tên xe, slug chuẩn SEO, phân khúc xe, chính sách khuyến mãi và trạng thái hiển thị.
// Sử dụng Input primitive từ @cardealer/ui (Invariant 11) và CSS classes tiêu chuẩn.

interface TabGeneralInfoProps {
  tenXe: string;
  setTenXe: (v: string) => void;
  carSlug: string;
  setCarSlug: (v: string) => void;
  anhDaiDienUrl: string;
  setAnhDaiDienUrl: (v: string) => void;
  segment: string;
  setSegment: (v: string) => void;
  traTruocTu: string;
  setTraTruocTu: (v: string) => void;
  promotionSummary: string;
  setPromotionSummary: (v: string) => void;
  moTaChung: string;
  setMoTaChung: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  isFeatured: boolean;
  setIsFeatured: (v: boolean) => void;
}

export function TabGeneralInfo({
  tenXe,
  setTenXe,
  carSlug,
  setCarSlug,
  anhDaiDienUrl,
  setAnhDaiDienUrl,
  segment,
  setSegment,
  traTruocTu,
  setTraTruocTu,
  promotionSummary,
  setPromotionSummary,
  moTaChung,
  setMoTaChung,
  status,
  setStatus,
  isFeatured,
  setIsFeatured,
}: TabGeneralInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div>
        <Input
          label="Tên Dòng Xe *"
          placeholder="Ví dụ: Hyundai Tucson 2025"
          value={tenXe}
          onChange={(e) => setTenXe(e.target.value)}
          required
        />
      </div>

      <div>
        <Input
          label="Đường Dẫn URL (Slug) *"
          placeholder="Ví dụ: tucson-2025"
          value={carSlug}
          onChange={(e) => setCarSlug(e.target.value)}
          required
        />
      </div>

      <div className="md:col-span-2">
        <Input
          label="Ảnh Đại Diện Xe (URL)"
          placeholder="Ví dụ: /images/cars/tucson.webp"
          value={anhDaiDienUrl}
          onChange={(e) => setAnhDaiDienUrl(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Phân Khúc Xe
        </label>
        <select
          value={segment}
          onChange={(e) => setSegment(e.target.value)}
          className="w-full px-3.5 py-2.5 text-sm bg-slate-900/80 border border-slate-700/60 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors"
        >
          <option value="suv">SUV / Crossover</option>
          <option value="sedan">Sedan</option>
          <option value="mpv">MPV Đa Dụng</option>
          <option value="hatchback">Hatchback</option>
          <option value="ev">Xe Điện EV</option>
        </select>
      </div>

      <div>
        <Input
          label="Trả Trước Kích Cầu (VNĐ)"
          type="number"
          placeholder="Ví dụ: 150000000"
          value={traTruocTu}
          onChange={(e) => setTraTruocTu(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Trạng Thái Xuất Bản
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full px-3.5 py-2.5 text-sm bg-slate-900/80 border border-slate-700/60 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors"
        >
          <option value="published">Đang Công Khai (Hiển thị ngoài web)</option>
          <option value="draft">Bản Nháp (Chỉ Admin thấy)</option>
        </select>
      </div>

      <div className="md:col-span-2">
        <Input
          label="Tóm Tắt Chương Trình Ưu Đãi / Khuyến Mãi"
          placeholder="Ví dụ: Hỗ trợ 50% trước bạ + Tặng gói phụ kiện cao cấp chính hãng"
          value={promotionSummary}
          onChange={(e) => setPromotionSummary(e.target.value)}
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-xs font-semibold text-slate-300 mb-1.5">
          Mô Tả Tổng Quan Dòng Xe
        </label>
        <textarea
          rows={3}
          value={moTaChung}
          onChange={(e) => setMoTaChung(e.target.value)}
          className="w-full px-3.5 py-2.5 text-sm bg-slate-900/80 border border-slate-700/60 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors"
          placeholder="Giới thiệu ngôn ngữ thiết kế, điểm nổi bật của dòng xe..."
        />
      </div>

      <div className="md:col-span-2 flex items-center gap-3 pt-2">
        <input
          type="checkbox"
          id="featuredCar"
          checked={isFeatured}
          onChange={(e) => setIsFeatured(e.target.checked)}
          className="w-4 h-4 rounded text-sky-600 bg-slate-900 border-slate-700 focus:ring-sky-500 cursor-pointer"
        />
        <label htmlFor="featuredCar" className="text-sm text-slate-200 cursor-pointer select-none">
          Đánh dấu là <strong className="text-sky-400">Dòng Xe Bán Chạy / Nổi Bật</strong> trên Trang Chủ
        </label>
      </div>
    </div>
  );
}

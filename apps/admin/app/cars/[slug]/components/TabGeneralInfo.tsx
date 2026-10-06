import React, { useState } from 'react';
import { Image as ImageIcon, X, ExternalLink } from 'lucide-react';
import { Button, Input } from '@cardealer/ui';
import { MediaPickerModal } from '../../../components/MediaPickerModal';

// 🧠 Mental Model: Tab 1 - Thông tin cơ bản dòng xe.
// Quản lý tên xe, slug chuẩn SEO, phân khúc xe, chính sách khuyến mãi và trạng thái hiển thị.
// Tích hợp MediaPickerModal hỗ trợ chọn ảnh từ kho thư viện hoặc kéo thả tải ảnh mới trực tiếp.

interface TabGeneralInfoProps {
  tenXe: string;
  setTenXe: (v: string) => void;
  carSlug: string;
  setCarSlug: (v: string) => void;
  anhDaiDienUrl: string;
  setAnhDaiDienUrl: (v: string) => void;
  galleryImages: string[];
  setGalleryImages: (imgs: string[]) => void;
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
  galleryImages,
  setGalleryImages,
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
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isGalleryPickerOpen, setIsGalleryPickerOpen] = useState(false);

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, idx) => idx !== index));
  };

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

      <div className="md:col-span-2 space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-300">
            Ảnh Đại Diện Xe (URL)
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsMediaPickerOpen(true)}
            className="h-7 text-xs flex items-center gap-1.5 cursor-pointer border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-sky-400 hover:text-sky-300"
          >
            <ImageIcon size={13} />
            <span>Chọn Từ Thư Viện / Tải Mới</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Ví dụ: /images/cars/tucson.webp hoặc chọn từ Thư Viện Ảnh"
            value={anhDaiDienUrl}
            onChange={(e) => setAnhDaiDienUrl(e.target.value)}
            className="font-mono text-xs flex-1"
          />
          {anhDaiDienUrl && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setAnhDaiDienUrl('')}
              className="h-10 w-10 shrink-0 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
              aria-label="Xóa ảnh đại diện"
            >
              <X size={16} />
            </Button>
          )}
        </div>

        {/* Thumbnail Preview */}
        {anhDaiDienUrl && (
          <div className="relative aspect-16/9 max-w-sm rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden p-2 flex items-center justify-center group shadow-md">
            <img
              src={anhDaiDienUrl}
              alt="Ảnh đại diện xe"
              className="h-full w-full object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
            <a
              href={anhDaiDienUrl}
              target="_blank"
              rel="noreferrer"
              className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-slate-900/80 px-2 py-1 text-[11px] font-medium text-slate-300 backdrop-blur-xs hover:bg-slate-800 hover:text-white transition-opacity"
            >
              <ExternalLink size={11} />
              <span>Xem ảnh</span>
            </a>
          </div>
        )}
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

      {/* 📸 Album Ảnh Thực Tế (Gallery) */}
      <div className="md:col-span-2 space-y-3 pt-4 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <label className="block text-xs font-semibold text-slate-200">
              Album Ảnh Thực Tế Của Xe (Gallery / Lightbox)
            </label>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Ảnh chi tiết nội ngoại thất thực tế (khoang lái, ghế, mâm lốp, cốp xe) hiển thị trong khối Thư Viện Ảnh trên web.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsGalleryPickerOpen(true)}
            className="h-8 text-xs flex items-center gap-1.5 cursor-pointer border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-sky-400 hover:text-sky-300 shrink-0"
          >
            <ImageIcon size={14} />
            <span>Thêm Ảnh Từ Thư Viện</span>
          </Button>
        </div>

        {galleryImages.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-slate-800 bg-slate-950/40 text-center space-y-2">
            <ImageIcon className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">
              Chưa có ảnh thực tế nào trong bộ sưu tập.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsGalleryPickerOpen(true)}
              className="text-xs text-sky-400 border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20"
            >
              Chọn ảnh từ Thư Viện
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {galleryImages.map((imgUrl, idx) => (
              <div
                key={`${imgUrl}-${idx}`}
                className="group relative aspect-4/3 rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden shadow-xs hover:border-sky-500/50 transition-all"
              >
                <img
                  src={imgUrl}
                  alt={`Ảnh thực tế ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-1.5 left-1.5 w-5 h-5 rounded-md bg-slate-900/80 text-[10px] font-bold text-slate-300 flex items-center justify-center backdrop-blur-xs">
                  {idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveGalleryImage(idx)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md bg-rose-500/80 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                  title="Xóa ảnh này khỏi album"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
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

      {/* Modal Chọn / Tải Ảnh Đại Diện Dùng Chung */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        mode="single"
        title="Chọn Ảnh Đại Diện Cho Dòng Xe"
        initialSelectedUrls={anhDaiDienUrl ? [anhDaiDienUrl] : []}
        onSelect={(selected) => {
          if (selected.length > 0) {
            setAnhDaiDienUrl(selected[0].url);
          }
        }}
      />

      {/* Modal Chọn Nhiều Ảnh Cho Album Gallery */}
      <MediaPickerModal
        isOpen={isGalleryPickerOpen}
        onClose={() => setIsGalleryPickerOpen(false)}
        mode="multiple"
        title="Chọn Ảnh Cho Album Thực Tế (Gallery)"
        initialSelectedUrls={galleryImages}
        onSelect={(selected) => {
          if (selected.length > 0) {
            const newUrls = selected.map((s) => s.url);
            setGalleryImages(Array.from(new Set([...galleryImages, ...newUrls])));
          }
        }}
      />
    </div>
  );
}

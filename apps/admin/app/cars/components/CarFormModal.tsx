import React, { useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Car as CarIcon, Sparkles, ExternalLink } from 'lucide-react';
import {
  Modal,
  Button,
  Input,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@cardealer/ui';

export const carFormSchema = z.object({
  tenXe: z.string().trim().min(1, 'Vui lòng nhập tên dòng xe'),
  slug: z.string().trim().min(1, 'Vui lòng nhập đường dẫn URL (slug) hợp lệ'),
  segment: z.enum(['suv', 'sedan', 'mpv', 'hatchback', 'ev']),
  giaKhoiDiem: z.string().trim().min(1, 'Vui lòng nhập giá niêm yết khởi điểm'),
  traTruocTu: z.string(),
  anhDaiDienUrl: z.string(),
  promotionSummary: z.string(),
  moTaChung: z.string(),
  status: z.enum(['published', 'draft']),
  isFeatured: z.boolean(),
});

export type CarFormData = z.infer<typeof carFormSchema>;

interface CarFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CarFormData) => Promise<void>;
  saving: boolean;
  errorMessage?: string | null;
}

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const CarFormModal: React.FC<CarFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  saving,
  errorMessage,
}) => {
  const form = useForm<CarFormData>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      tenXe: '',
      slug: '',
      segment: 'suv',
      giaKhoiDiem: '',
      traTruocTu: '',
      anhDaiDienUrl: '',
      promotionSummary: '',
      moTaChung: '',
      status: 'published',
      isFeatured: false,
    },
    mode: 'onChange',
  });

  const { watch, setValue, reset } = form;
  const watchedTenXe = watch('tenXe');
  const watchedSlug = watch('slug');
  const watchedAnhDaiDienUrl = watch('anhDaiDienUrl');
  const watchedSegment = watch('segment');
  const watchedGiaKhoiDiem = watch('giaKhoiDiem');
  const watchedTraTruocTu = watch('traTruocTu');

  useEffect(() => {
    if (isOpen) {
      reset({
        tenXe: '',
        slug: '',
        segment: 'suv',
        giaKhoiDiem: '',
        traTruocTu: '',
        anhDaiDienUrl: '',
        promotionSummary: '',
        moTaChung: '',
        status: 'published',
        isFeatured: false,
      });
    }
  }, [isOpen, reset]);

  const handleTenXeChange = (val: string) => {
    const currentSlug = watchedSlug;
    const autoSlug = toSlug(watchedTenXe);
    const shouldUpdateSlug = !currentSlug || currentSlug === autoSlug;
    if (shouldUpdateSlug) {
      const newSlug = toSlug(val);
      setValue('slug', newSlug, { shouldValidate: true });
      if (!watchedAnhDaiDienUrl || watchedAnhDaiDienUrl === `/images/cars/${autoSlug}.webp`) {
        setValue('anhDaiDienUrl', `/images/cars/${newSlug}.webp`);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm Dòng Xe Hyundai Mới"
      description="Tạo nhanh dòng xe mới và tự động thiết lập danh mục sản phẩm Showroom"
      className="max-w-2xl border-sky-500/30 bg-slate-900/95 max-h-[90vh] overflow-y-auto"
    >
      {/* Banner mở trình soạn thảo chuyên sâu */}
      <div className="p-3 mb-4 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-between text-xs text-slate-300">
        <span className="flex items-center gap-2">
          <Sparkles size={15} className="text-amber-400 shrink-0" />
          Cần cấu hình chi tiết 4 tab (Phiên bản, Mã màu, 6 Thông số)?
        </span>
        <Link
          href="/cars/new"
          onClick={onClose}
          className="inline-flex items-center gap-1 font-semibold text-[#0072CE] hover:text-sky-300 hover:underline shrink-0"
        >
          Trình soạn thảo đầy đủ
          <ExternalLink size={12} />
        </Link>
      </div>

      {/* Thông báo lỗi nếu có */}
      {errorMessage && (
        <div className="mb-4 p-3.5 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs font-medium">
          {errorMessage}
        </div>
      )}

      {/* Live Preview Card xe tóm tắt */}
      <div className="mb-4 p-4 rounded-xl bg-slate-950/60 border border-white/10 flex items-center gap-4">
        <div className="w-20 h-14 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
          {watchedAnhDaiDienUrl ? (
            <img
              src={watchedAnhDaiDienUrl}
              alt={watchedTenXe || 'Preview'}
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <CarIcon size={24} className="text-slate-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold text-white truncate">
            {watchedTenXe || 'Tên dòng xe (VD: Hyundai Tucson 2025)'}
          </div>
          <div className="text-xs text-slate-400 font-mono">
            /{watchedSlug || 'duong-dan-slug'}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[#0072CE]/20 text-sky-400 border border-[#0072CE]/30">
              {(watchedSegment || 'suv').toUpperCase()}
            </span>
            {watchedGiaKhoiDiem && (
              <span className="text-xs font-bold text-emerald-400">
                Từ {Number(watchedGiaKhoiDiem).toLocaleString('vi-VN')} đ
              </span>
            )}
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="tenXe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên Dòng Xe *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="VD: Hyundai Palisade 2025"
                      onChange={(e) => {
                        field.onChange(e);
                        handleTenXeChange(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Đường Dẫn URL (slug) *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="VD: hyundai-palisade-2025"
                      onChange={(e) => field.onChange(toSlug(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="segment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phân Khúc Xe *</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-900/90 border border-slate-700/60 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0072CE] transition-colors"
                    >
                      <option value="suv">SUV / Crossover</option>
                      <option value="sedan">Sedan</option>
                      <option value="mpv">MPV Đa Dụng</option>
                      <option value="hatchback">Hatchback / Đô Thị</option>
                      <option value="ev">Xe Thuần Điện (EV)</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="giaKhoiDiem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Giá Niêm Yết Khởi Điểm (VNĐ) *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      step="any"
                      placeholder="VD: 1469000000"
                    />
                  </FormControl>
                  {field.value && !isNaN(Number(field.value)) && Number(field.value) > 0 && (
                    <span className="text-[11px] text-emerald-400 font-semibold inline-block">
                      ≈ {Number(field.value).toLocaleString('vi-VN')} VNĐ
                    </span>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="traTruocTu"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ước Tính Trả Trước Từ (VNĐ)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      step="any"
                      placeholder="VD: 290000000"
                    />
                  </FormControl>
                  {field.value && !isNaN(Number(field.value)) && Number(field.value) > 0 && (
                    <span className="text-[11px] text-sky-400 font-semibold inline-block">
                      ≈ {Number(field.value).toLocaleString('vi-VN')} VNĐ
                    </span>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng Thái Hiển Thị</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="w-full px-3.5 py-2.5 text-sm bg-slate-900/90 border border-slate-700/60 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0072CE] transition-colors"
                    >
                      <option value="published">Đang Bán (Công khai trên Web)</option>
                      <option value="draft">Bản Nháp (Ẩn khỏi Web)</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="anhDaiDienUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đường Dẫn Ảnh Đại Diện Xe (URL)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="/images/cars/palisade-2025.webp" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="promotionSummary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tóm Tắt Ưu Đãi / Khuyến Mãi Nổi Bật</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="VD: Hỗ trợ 50% Lệ phí trước bạ + Tặng gói phụ kiện cao cấp"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="moTaChung"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô Tả Tổng Quan</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        rows={2}
                        placeholder="Mô tả ngắn gọn về thiết kế, tiện nghi và động cơ..."
                        className="w-full px-3.5 py-2 text-sm bg-slate-900/80 border border-slate-700/60 rounded-xl text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0072CE] transition-colors"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="md:col-span-2 flex items-center gap-2 pt-1 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      id="modalIsFeatured"
                      checked={field.value}
                      onChange={field.onChange}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-[#0072CE] focus:ring-[#0072CE] cursor-pointer"
                    />
                  </FormControl>
                  <label htmlFor="modalIsFeatured" className="text-xs font-medium text-slate-300 cursor-pointer">
                    Đánh dấu là Dòng Xe Hot / Bán Chạy (Hiển thị nổi bật trang chủ)
                  </label>
                </FormItem>
              )}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="ghost" type="button" onClick={onClose} disabled={saving}>
              Hủy Bỏ
            </Button>
            <Button
              variant="accent"
              type="submit"
              glow
              isLoading={saving}
              leftIcon={<CarIcon size={16} />}
            >
              {saving ? 'Đang Tạo Xe...' : 'Tạo Dòng Xe'}
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
};

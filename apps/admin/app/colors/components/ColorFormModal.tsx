import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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

export const colorFormSchema = z.object({
  tenMau: z.string().trim().min(1, 'Vui lòng nhập tên màu sơn'),
  hexCode: z
    .string()
    .trim()
    .regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Mã màu HEX không hợp lệ (VD: #FFFFFF hoặc #FFF)'),
  isTwoTone: z.boolean(),
  secondaryHexCode: z.string(),
  swatchUrl: z.string(),
});

export type ColorFormData = z.infer<typeof colorFormSchema>;

interface ColorFormModalProps {
  isOpen?: boolean;
  editingId: string | null;
  formData: ColorFormData;
  onSave: (data: ColorFormData) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

// 🧠 Mental Model: Popup Modal quản lý mã màu Master với live color-picker, Two-Tone roof và xem trước màu sơn thực tế.
// Sử dụng Form compound components từ @cardealer/ui với react-hook-form & Zod Schema Validation.
export const ColorFormModal: React.FC<ColorFormModalProps> = ({
  isOpen = true,
  editingId,
  formData,
  onSave,
  onCancel,
  isSaving = false,
}) => {
  const form = useForm<ColorFormData>({
    resolver: zodResolver(colorFormSchema),
    defaultValues: formData,
    mode: 'onChange',
  });

  const { reset, watch } = form;
  const watchedHexCode = watch('hexCode') || '#0072CE';
  const watchedIsTwoTone = watch('isTwoTone');
  const watchedSecondaryHexCode = watch('secondaryHexCode') || '#000000';
  const watchedTenMau = watch('tenMau');

  useEffect(() => {
    if (isOpen) {
      reset(formData);
    }
  }, [isOpen, formData, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={editingId ? 'Cập Nhật Mã Màu Sơn Master' : 'Thêm Mã Màu Sơn Ngoại Thất Mới'}
      description="Lưu vào bảng danh mục màu dùng chung toàn hệ thống Showroom"
      className="max-w-xl border-sky-500/30 bg-slate-900/95"
    >
      {/* Live Color Preview Swatch */}
      <div
        className="h-20 w-full rounded-xl relative border border-white/15 overflow-hidden shadow-inner mb-5"
        style={{
          background:
            watchedIsTwoTone && watchedSecondaryHexCode
              ? `linear-gradient(135deg, ${watchedHexCode} 55%, ${watchedSecondaryHexCode} 55%)`
              : watchedHexCode,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/20 pointer-events-none" />
        <div className="absolute bottom-2 left-3 z-10 text-xs font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {watchedTenMau || 'Tên màu xem trước'}
        </div>
        {watchedIsTwoTone && (
          <div className="absolute top-2 right-2 z-10">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-white border border-white/20 shadow-md">
              Two-Tone Roof
            </span>
          </div>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="tenMau"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên Màu Sơn (Tiếng Việt & Quốc tế) *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="VD: Trắng Ngọc Trai (Atlas White)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hexCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã Màu HEX Thân Xe *</FormLabel>
                  <FormControl>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={field.value}
                        onChange={field.onChange}
                        className="w-10 h-10 p-1 rounded-lg border border-slate-700 bg-transparent cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="#FFFFFF"
                        className="flex-1 px-3.5 py-2 text-sm bg-slate-900/80 border border-slate-700/60 rounded-lg text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-[#0072CE] transition-colors"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="swatchUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ảnh Mẫu Swatch / Chất Liệu Sơn Thật (swatchUrl - Tùy chọn)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="/images/swatches/atlas-white.png"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isTwoTone"
              render={({ field }) => (
                <FormItem className="md:col-span-2 flex items-center gap-2 pt-2 border-t border-white/10 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      id="modalIsTwoTone"
                      checked={field.value}
                      onChange={field.onChange}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-[#0072CE] focus:ring-[#0072CE] cursor-pointer"
                    />
                  </FormControl>
                  <label htmlFor="modalIsTwoTone" className="text-xs font-semibold text-slate-200 cursor-pointer">
                    Màu Sơn Phối 2 Tông Màu (Two-Tone Roof Nóc Đen Thể Thao)
                  </label>
                </FormItem>
              )}
            />

            {watchedIsTwoTone && (
              <div className="md:col-span-2 animate-in fade-in">
                <FormField
                  control={form.control}
                  name="secondaryHexCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mã Màu HEX Nóc Xe *</FormLabel>
                      <FormControl>
                        <div className="flex gap-2 items-center">
                          <input
                            type="color"
                            value={field.value}
                            onChange={field.onChange}
                            className="w-10 h-10 p-1 rounded-lg border border-slate-700 bg-transparent cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="#000000"
                            className="flex-1 px-3.5 py-2 text-sm bg-slate-900/80 border border-slate-700/60 rounded-lg text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-[#0072CE] transition-colors"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="ghost" type="button" onClick={onCancel} disabled={isSaving}>
              Hủy Bỏ
            </Button>
            <Button variant="accent" type="submit" glow isLoading={isSaving}>
              {editingId ? 'Cập Nhật Màu Sắc' : 'Lưu Màu Sắc'}
            </Button>
          </div>
        </form>
      </Form>
    </Modal>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import { FolderPlus, Edit3, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { Modal, Button, Input, Textarea, Label } from '@cardealer/ui';
import { slugifyVietnamese } from '@cardealer/core';
import { createCategorySchema, type CategoryDTO } from '@cardealer/types';
import { categoryService } from '../../services/category.service';

export interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: CategoryDTO | null;
  onSuccess: (savedCategory: CategoryDTO) => void;
}

// 🧠 Mental Model: CategoryModal - Modal Thêm mới & Chỉnh sửa Chuyên mục
// 1. Tự động sinh slug tiếng Việt chuẩn SEO từ Tên chuyên mục khi người dùng gõ
// 2. Cho phép Admin chủ động sửa slug thủ công bất kỳ lúc nào (isManualSlug flag)
// 3. Hiển thị URL Preview trực quan: https://domain.com/tin-tuc?category={slug}
// 4. Bắt lỗi Unique Slug Conflict (409) và hiển thị thông báo tiếng Việt trực quan
export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  onSuccess,
}) => {
  const isEditing = Boolean(category?.id);

  const [tenChuyenMuc, setTenChuyenMuc] = useState('');
  const [slug, setSlug] = useState('');
  const [moTa, setMoTa] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(0);

  const [isManualSlug, setIsManualSlug] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (category) {
        setTenChuyenMuc(category.tenChuyenMuc || '');
        setSlug(category.slug || '');
        setMoTa(category.moTa || '');
        setSortOrder(category.sortOrder ?? 0);
        setIsManualSlug(true); // Khi edit giữ nguyên slug có sẵn
      } else {
        setTenChuyenMuc('');
        setSlug('');
        setMoTa('');
        setSortOrder(0);
        setIsManualSlug(false);
      }
      setFormError(null);
      setFieldErrors({});
    }
  }, [isOpen, category]);

  // Tự động sinh Slug khi nhập tên chuyên mục (nếu chưa sửa tay)
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTenChuyenMuc(val);
    setFieldErrors((prev) => ({ ...prev, tenChuyenMuc: '' }));

    if (!isManualSlug) {
      const generated = slugifyVietnamese(val);
      setSlug(generated);
      setFieldErrors((prev) => ({ ...prev, slug: '' }));
    }
  };

  // Người dùng chủ động sửa Slug
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setIsManualSlug(true);
    // Sanitize chỉ giữ chữ thường, số và dấu gạch ngang
    const sanitized = rawVal.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(sanitized);
    setFieldErrors((prev) => ({ ...prev, slug: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const payload = {
      tenChuyenMuc: tenChuyenMuc.trim(),
      slug: (slug.trim() || slugifyVietnamese(tenChuyenMuc)).trim(),
      moTa: moTa.trim() || null,
      sortOrder: Number(sortOrder) || 0,
    };

    // Client-side Zod validation
    const parsed = createCategorySchema.safeParse(payload);
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (field && !errors[field]) {
          errors[field] = issue.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    try {
      setLoading(true);
      let result: CategoryDTO;

      if (isEditing && category) {
        result = await categoryService.updateCategory(category.id, payload);
      } else {
        result = await categoryService.createCategory(payload);
      }

      onSuccess(result);
      onClose();
    } catch (err: unknown) {
      const errObj = err as { code?: string; message?: string };
      if (errObj.code === 'SLUG_CONFLICT') {
        setFieldErrors((prev) => ({
          ...prev,
          slug: errObj.message || 'Slug này đã tồn tại trên hệ thống, vui lòng chọn slug khác.',
        }));
      } else {
        setFormError(errObj.message || 'Có lỗi xảy ra khi lưu chuyên mục. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => {} : onClose}
      className="max-w-xl"
      title={
        <div className="flex items-center gap-2.5 text-lg font-bold text-white">
          <div className="w-8 h-8 rounded-lg bg-[#0072CE]/20 text-[#0072CE] border border-[#0072CE]/30 flex items-center justify-center">
            {isEditing ? <Edit3 size={18} /> : <FolderPlus size={18} />}
          </div>
          <span>{isEditing ? 'Chỉnh Sửa Chuyên Mục' : 'Thêm Mới Chuyên Mục Bài Viết'}</span>
        </div>
      }
      description="Quản lý chuyên mục giúp phân loại tin tức, đánh giá xe và khuyến mãi trên website."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {formError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs leading-relaxed animate-in fade-in">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* 1. Tên Chuyên Mục */}
        <div className="space-y-1.5">
          <Label htmlFor="category-name" className="text-xs font-semibold text-slate-300">
            Tên Chuyên Mục <span className="text-red-400">*</span>
          </Label>
          <Input
            id="category-name"
            type="text"
            placeholder="Ví dụ: Đánh Giá Xe Hyundai"
            value={tenChuyenMuc}
            onChange={handleNameChange}
            disabled={loading}
            className={fieldErrors.tenChuyenMuc ? 'border-red-500/50 focus:border-red-500' : ''}
            autoFocus
          />
          {fieldErrors.tenChuyenMuc && (
            <p className="text-[11px] text-red-400 font-medium">{fieldErrors.tenChuyenMuc}</p>
          )}
        </div>

        {/* 2. Slug (Tự động + Cho phép sửa) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="category-slug" className="text-xs font-semibold text-slate-300">
              Đường Dẫn Slug (SEO) <span className="text-red-400">*</span>
            </Label>
            {isManualSlug && (
              <button
                type="button"
                onClick={() => {
                  setIsManualSlug(false);
                  setSlug(slugifyVietnamese(tenChuyenMuc));
                  setFieldErrors((prev) => ({ ...prev, slug: '' }));
                }}
                className="text-[11px] text-[#0072CE] hover:underline"
              >
                Khôi phục tự động sinh
              </button>
            )}
          </div>
          <div className="relative">
            <Input
              id="category-slug"
              type="text"
              placeholder="danh-gia-xe"
              value={slug}
              onChange={handleSlugChange}
              disabled={loading}
              className={`pl-8 font-mono text-xs ${fieldErrors.slug ? 'border-red-500/50 focus:border-red-500' : ''}`}
            />
            <LinkIcon size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>
          {fieldErrors.slug ? (
            <p className="text-[11px] text-red-400 font-medium">{fieldErrors.slug}</p>
          ) : (
            <p className="text-[11px] text-slate-500 font-mono">
              URL xem: /tin-tuc?category=<span className="text-cyan-400">{slug || '...'}</span>
            </p>
          )}
        </div>

        {/* 3. Thứ Tự Hiển Thị */}
        <div className="space-y-1.5">
          <Label htmlFor="category-order" className="text-xs font-semibold text-slate-300">
            Thứ Tự Sắp Xếp (Số nhỏ đứng trước)
          </Label>
          <Input
            id="category-order"
            type="number"
            min={0}
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            disabled={loading}
          />
        </div>

        {/* 4. Mô Tả Chuyên Mục (SEO) */}
        <div className="space-y-1.5">
          <Label htmlFor="category-desc" className="text-xs font-semibold text-slate-300">
            Mô Tả Giới Thiệu Chuyên Mục (SEO)
          </Label>
          <Textarea
            id="category-desc"
            rows={3}
            placeholder="Đoạn văn ngắn giới thiệu về chuyên mục xuất hiện trên Storefront..."
            value={moTa}
            onChange={(e) => setMoTa(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            size="sm"
            className="px-4"
          >
            Hủy Bỏ
          </Button>
          <Button
            type="submit"
            variant="accent"
            size="sm"
            isLoading={loading}
            disabled={loading}
            className="px-5 bg-[#0072CE] text-white"
          >
            {isEditing ? 'Cập Nhật Chuyên Mục' : 'Tạo Chuyên Mục Mới'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

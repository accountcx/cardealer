'use client';

import React, { useState } from 'react';
import { AlertTriangle, Trash2, ShieldAlert } from 'lucide-react';
import { Modal, Button } from '@cardealer/ui';
import type { CategoryDTO } from '@cardealer/types';
import { categoryService } from '../../services/category.service';

export interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryDTO | null;
  onSuccess: (deletedId: string) => void;
}

// 🧠 Mental Model: DeleteCategoryModal - Dual-Layer Restrict Guard UI
// 1. Nếu postCount > 0: Chặn xóa chủ động ngay trên UI, hiển thị cảnh báo giải thích rõ ràng và KHÔNG hiển thị nút Xóa.
// 2. Nếu postCount == 0: Cho phép xác nhận xóa an toàn kèm loading state và xử lý fallback nếu có lỗi từ API.
export const DeleteCategoryModal: React.FC<DeleteCategoryModalProps> = ({
  isOpen,
  onClose,
  category,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!category) return null;

  const hasPosts = (category.postCount ?? 0) > 0;

  const handleConfirmDelete = async () => {
    if (hasPosts) return;

    try {
      setLoading(true);
      setError(null);
      await categoryService.deleteCategory(category.id);
      onSuccess(category.id);
      onClose();
    } catch (err: unknown) {
      const errObj = err as { code?: string; message?: string };
      setError(errObj.message || 'Không thể xóa chuyên mục này. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => {} : onClose}
      className="max-w-md"
    >
      <div className="flex flex-col items-center text-center p-2">
        {/* Glowing Icon Badge */}
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
            hasPosts
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
              : 'bg-red-500/15 text-red-400 border border-red-500/30 shadow-[0_0_25px_rgba(239,68,68,0.2)]'
          }`}
        >
          {hasPosts ? <ShieldAlert size={28} /> : <Trash2 size={28} />}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-100 mb-2">
          {hasPosts ? 'Không Thể Xóa Chuyên Mục Này' : 'Xác Nhận Xóa Chuyên Mục'}
        </h3>

        {/* Dynamic Explanation Message */}
        {hasPosts ? (
          <div className="text-xs text-slate-300 leading-relaxed mb-6 space-y-2 bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl text-left">
            <p className="font-semibold text-amber-300 flex items-center gap-1.5">
              <AlertTriangle size={15} className="flex-shrink-0" />
              <span>Chuyên mục đang chứa nội dung:</span>
            </p>
            <p>
              Chuyên mục <strong className="text-white">"{category.tenChuyenMuc}"</strong> hiện đang có{' '}
              <span className="inline-flex px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-200 font-bold">
                {category.postCount}
              </span>{' '}
              bài viết đang liên kết.
            </p>
            <p className="text-[11px] text-slate-400">
              Quy định toàn vẹn dữ liệu ngăn chặn việc xóa chuyên mục này để tránh tạo ra bài viết mồ côi (Orphan posts). Vui lòng chuyển các bài viết sang chuyên mục khác trước khi xóa.
            </p>
          </div>
        ) : (
          <div className="mb-6 space-y-2">
            <p className="text-sm text-slate-300">
              Bạn có chắc chắn muốn xóa vĩnh viễn chuyên mục{' '}
              <strong className="text-white">"{category.tenChuyenMuc}"</strong>?
            </p>
            <p className="text-xs text-slate-400">
              Hành động này sẽ xóa hoàn toàn chuyên mục khỏi cơ sở dữ liệu và không thể hoàn tác.
            </p>
          </div>
        )}

        {error && (
          <div className="w-full p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs mb-4 text-left">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 w-full border-t border-white/10 pt-4">
          {hasPosts ? (
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="w-full text-sm font-semibold"
            >
              Đã Hiểu (Đóng)
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
                className="flex-1 text-sm font-semibold"
              >
                Hủy Bỏ
              </Button>

              <Button
                type="button"
                variant="danger"
                onClick={handleConfirmDelete}
                isLoading={loading}
                disabled={loading}
                className="flex-1 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white"
              >
                Xóa Vĩnh Viễn
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

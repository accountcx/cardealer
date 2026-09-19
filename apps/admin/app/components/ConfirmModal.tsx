'use client';

import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Modal, Button } from '@cardealer/ui';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning';
  loading?: boolean;
}

// 🧠 Mental Model: Canonical Confirmation Dialog Modal
// Thay thế hoàn toàn browser window.confirm() bằng hộp thoại kính mờ cao cấp,
// hiển thị rõ icon cảnh báo và 2 nút bấm Hủy bỏ / Xác nhận với trạng thái loading.
export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận xóa',
  cancelText = 'Hủy bỏ',
  variant = 'danger',
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={loading ? () => {} : onClose} className="max-w-md">
      <div className="flex flex-col items-center text-center p-2">
        {/* Glowing Icon Badge */}
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
            variant === 'danger'
              ? 'bg-red-500/15 text-red-400 border border-red-500/30 shadow-[0_0_25px_rgba(239,68,68,0.2)]'
              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
          }`}
        >
          {variant === 'danger' ? <Trash2 size={26} /> : <AlertTriangle size={26} />}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-100 mb-2">{title}</h3>

        {/* Message */}
        <p className="text-sm text-slate-400 leading-relaxed mb-6">{message}</p>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 w-full border-t border-white/10 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="flex-1 text-sm font-semibold"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            variant={variant === 'danger' ? 'danger' : 'accent'}
            onClick={onConfirm}
            isLoading={loading}
            disabled={loading}
            className="flex-1 text-sm font-semibold"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

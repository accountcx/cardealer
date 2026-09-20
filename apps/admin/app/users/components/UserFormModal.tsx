// 🧠 Mental Model: Modal Form Thêm Mới & Chỉnh Sửa Nhân Sự (SOP UI v2.2.4)
// Tuân thủ 100% Named Export, tái sử dụng Modal từ @cardealer/ui (Shared Primitives First)
// Chỉ sử dụng icon từ lucide-react, zero arbitrary values, WCAG AAA Reduced Motion.
import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from '@cardealer/ui';
import { User, Mail, Phone, Shield, Lock, Image as ImageIcon, AlertCircle } from 'lucide-react';
import type { UserResponse, Role, UserStatus } from '@cardealer/types';

export interface UserFormData {
  email: string;
  fullName: string;
  phone: string;
  avatarUrl: string;
  role: Role;
  status: UserStatus;
  password?: string;
}

export interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  initialData?: UserResponse | null;
  loading?: boolean;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}) => {
  const isEdit = Boolean(initialData);

  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    fullName: '',
    phone: '',
    avatarUrl: '',
    role: 'sales',
    status: 'active',
    password: '',
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        email: initialData.email || '',
        fullName: initialData.fullName || '',
        phone: initialData.phone || '',
        avatarUrl: initialData.avatarUrl || '',
        role: initialData.role,
        status: initialData.status,
        password: '',
      });
    } else {
      setFormData({
        email: '',
        fullName: '',
        phone: '',
        avatarUrl: '',
        role: 'sales',
        status: 'active',
        password: '',
      });
    }
    setErrorMessage(null);
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Frontend validation
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      setErrorMessage('Họ tên phải có ít nhất 2 ký tự');
      return;
    }

    if (!isEdit) {
      if (!formData.email.trim() || !formData.email.includes('@')) {
        setErrorMessage('Email không đúng định dạng');
        return;
      }
      if (!formData.password || formData.password.length < 8) {
        setErrorMessage('Mật khẩu bắt buộc có ít nhất 8 ký tự (chữ hoa, chữ thường, số và ký tự đặc biệt)');
        return;
      }
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi lưu';
      setErrorMessage(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Chỉnh Sửa Thông Tin Nhân Viên' : 'Thêm Mới Nhân Viên Showroom'}
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Địa Chỉ Email {isEdit ? '(Cố định)' : <span className="text-rose-400">*</span>}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Mail size={16} />
            </div>
            <Input
              type="email"
              disabled={isEdit}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="nhanvien@hyundaivinh.com"
              className={`pl-10 h-11 ${isEdit ? 'opacity-60 cursor-not-allowed bg-slate-800/50' : ''}`}
              required={!isEdit}
            />
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Họ Và Tên <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <User size={16} />
            </div>
            <Input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Nguyễn Văn A"
              className="pl-10 h-11"
              required
            />
          </div>
        </div>

        {/* Password (Only in create mode) */}
        {!isEdit && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mật Khẩu Khởi Tạo <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock size={16} />
              </div>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Tối thiểu 8 ký tự (Hoa, thường, số, ký tự đặc biệt)"
                className="pl-10 h-11"
                required
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Ví dụ: Hyundai@2026. Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt.
            </p>
          </div>
        )}

        {/* Phone & Avatar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Số Điện Thoại</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Phone size={16} />
              </div>
              <Input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0987.654.321"
                className="pl-10 h-11"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Ảnh Đại Diện (URL)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <ImageIcon size={16} />
              </div>
              <Input
                type="url"
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="pl-10 h-11"
              />
            </div>
          </div>
        </div>

        {/* Role & Status Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Vai Trò Quản Trị <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Shield size={16} />
              </div>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                className="w-full pl-10 pr-4 h-11 rounded-xl bg-slate-900/90 border border-white/10 text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              >
                <option value="admin">Quản Trị Viên Tối Cao (Admin)</option>
                <option value="manager">Quản Lý Showroom (Manager)</option>
                <option value="editor">Biên Tập Viên Catalog (Editor)</option>
                <option value="sales">Nhân Viên Bán Hàng (Sales)</option>
              </select>
            </div>
          </div>

          {isEdit && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Trạng Thái Tài Khoản <span className="text-rose-400">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
                className="w-full px-4 h-11 rounded-xl bg-slate-900/90 border border-white/10 text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              >
                <option value="active">Đang Hoạt Động (Active)</option>
                <option value="suspended">Tạm Khóa (Suspended)</option>
                <option value="pending">Chờ Kích Hoạt (Pending)</option>
              </select>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <Button variant="ghost" type="button" onClick={onClose} disabled={loading}>
            Hủy Bỏ
          </Button>
          <Button variant="primary" type="submit" isLoading={loading} className="px-5">
            {isEdit ? 'Lưu Thay Đổi' : 'Tạo Tài Khoản'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

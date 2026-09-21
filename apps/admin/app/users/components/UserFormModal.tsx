// 🧠 Mental Model: Modal Form Thêm Mới & Chỉnh Sửa Nhân Sự (SOP UI v2.2.4)
// Tuân thủ 100% Named Export, tái sử dụng Modal, Form, Input, Select, Button từ @cardealer/ui
// Sử dụng react-hook-form, WCAG AAA Reduced Motion, zero arbitrary CSS.
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Modal,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Input,
  Select,
  Button,
} from '@cardealer/ui';
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

const DEFAULT_VALUES: UserFormData = {
  email: '',
  fullName: '',
  phone: '',
  avatarUrl: '',
  role: 'sales',
  status: 'active',
  password: '',
};

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading = false,
}) => {
  const isEdit = Boolean(initialData);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<UserFormData>({
    defaultValues: DEFAULT_VALUES,
    mode: 'onTouched',
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        email: initialData.email || '',
        fullName: initialData.fullName || '',
        phone: initialData.phone || '',
        avatarUrl: initialData.avatarUrl || '',
        role: initialData.role,
        status: initialData.status,
        password: '',
      });
    } else {
      form.reset(DEFAULT_VALUES);
    }
    setErrorMessage(null);
  }, [initialData, isOpen, form]);

  const handleFormSubmit = async (data: UserFormData) => {
    setErrorMessage(null);

    // Validation bổ sung cho mật khẩu mới
    if (!isEdit && (!data.password || data.password.length < 8)) {
      setErrorMessage('Mật khẩu bắt buộc có ít nhất 8 ký tự (chữ hoa, chữ thường, số và ký tự đặc biệt)');
      return;
    }

    try {
      await onSubmit(data);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đã có lỗi xảy ra khi lưu thông tin';
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium animate-in fade-in">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            rules={{
              required: !isEdit ? 'Vui lòng nhập địa chỉ email' : false,
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Email không đúng định dạng',
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Địa Chỉ Email {isEdit ? '(Cố định)' : <span className="text-rose-400">*</span>}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    disabled={isEdit}
                    leftIcon={<Mail size={16} />}
                    placeholder="nhanvien@hyundaivinh.com"
                    className={`h-11 ${isEdit ? 'opacity-60 cursor-not-allowed bg-slate-800/50' : ''}`}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Full Name */}
          <FormField
            control={form.control}
            name="fullName"
            rules={{
              required: 'Vui lòng nhập họ và tên',
              minLength: { value: 2, message: 'Họ tên phải có ít nhất 2 ký tự' },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Họ Và Tên <span className="text-rose-400">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    leftIcon={<User size={16} />}
                    placeholder="Nguyễn Văn A"
                    className="h-11"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password (Only in create mode) */}
          {!isEdit && (
            <FormField
              control={form.control}
              name="password"
              rules={{
                required: 'Vui lòng nhập mật khẩu khởi tạo',
                minLength: { value: 8, message: 'Mật khẩu tối thiểu 8 ký tự' },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Mật Khẩu Khởi Tạo <span className="text-rose-400">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      leftIcon={<Lock size={16} />}
                      placeholder="Tối thiểu 8 ký tự (Hoa, thường, số, ký tự đặc biệt)"
                      className="h-11"
                    />
                  </FormControl>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Ví dụ: Hyundai@2026. Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Phone & Avatar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số Điện Thoại</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      leftIcon={<Phone size={16} />}
                      placeholder="0987.654.321"
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ảnh Đại Diện (URL)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="url"
                      leftIcon={<ImageIcon size={16} />}
                      placeholder="https://images.unsplash.com/..."
                      className="h-11"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Role & Status Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Vai Trò Quản Trị <span className="text-rose-400">*</span>
                  </FormLabel>
                  <FormControl>
                    <Select
                      {...field}
                      className="h-11 bg-slate-900/90 border-white/10"
                      options={[
                        { value: 'admin', label: 'Quản Trị Viên Tối Cao (Admin)' },
                        { value: 'manager', label: 'Quản Lý Showroom (Manager)' },
                        { value: 'editor', label: 'Biên Tập Viên Catalog (Editor)' },
                        { value: 'sales', label: 'Nhân Viên Bán Hàng (Sales)' },
                      ]}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEdit && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Trạng Thái Tài Khoản <span className="text-rose-400">*</span>
                    </FormLabel>
                    <FormControl>
                      <Select
                        {...field}
                        className="h-11 bg-slate-900/90 border-white/10"
                        options={[
                          { value: 'active', label: 'Đang Hoạt Động (Active)' },
                          { value: 'suspended', label: 'Tạm Khóa (Suspended)' },
                          { value: 'pending', label: 'Chờ Kích Hoạt (Pending)' },
                        ]}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
      </Form>
    </Modal>
  );
};

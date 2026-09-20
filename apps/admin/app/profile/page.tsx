'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  Lock,
  Mail,
  Phone,
  Shield,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  EyeOff,
  KeyRound,
  Save,
  Clock,
} from 'lucide-react';
import { Button, Input, Badge, Skeleton } from '@cardealer/ui';
import { userService } from '../../services/user.service';
import type { UserResponse, Role } from '@cardealer/types';

interface NotificationState {
  type: 'success' | 'error';
  message: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'password'>('info');
  const [notification, setNotification] = useState<NotificationState | null>(null);

  // Profile Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userService.getProfile();
      setProfile(data);
      setFullName(data.fullName || '');
      setPhone(data.phone || '');
      setAvatarUrl(data.avatarUrl || '');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải thông tin hồ sơ';
      showNotification('error', msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 2) {
      showNotification('error', 'Họ tên phải có ít nhất 2 ký tự');
      return;
    }

    try {
      setSavingProfile(true);
      const updated = await userService.updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
      });
      setProfile(updated);
      showNotification('success', 'Cập nhật thông tin hồ sơ thành công!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi cập nhật hồ sơ';
      showNotification('error', msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      showNotification('error', 'Mật khẩu mới phải có ít nhất 8 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      showNotification('error', 'Mật khẩu xác nhận không trùng khớp');
      return;
    }

    try {
      setChangingPassword(true);
      const result = await userService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      showNotification('success', result.message || 'Đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi đổi mật khẩu';
      showNotification('error', msg);
    } finally {
      setChangingPassword(false);
    }
  };

  const getRoleLabel = (role?: Role) => {
    switch (role) {
      case 'admin':
        return 'Quản Trị Viên Tối Cao (Admin)';
      case 'manager':
        return 'Quản Lý Showroom (Manager)';
      case 'editor':
        return 'Biên Tập Viên Catalog (Editor)';
      case 'sales':
        return 'Nhân Viên Bán Hàng (Sales)';
      default:
        return role || '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400 mb-1">
          <User size={14} /> Tài Khoản Cá Nhân
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Hồ Sơ & Bảo Mật</h1>
        <p className="text-xs text-slate-400 mt-1">
          Quản lý thông tin tài khoản hiển thị và thiết lập bảo mật phiên đăng nhập.
        </p>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl text-xs font-semibold transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="p-1 hover:text-white" type="button">
            <X size={14} />
          </button>
        </div>
      )}

      {loading ? (
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/10 space-y-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Overview Card */}
          <div className="md:col-span-1 p-6 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-5 text-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-sky-500/30 mx-auto shadow-lg shadow-sky-500/10"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#002C6C] to-[#0072CE] border-2 border-white/10 flex items-center justify-center font-black text-2xl text-white mx-auto shadow-lg shadow-sky-500/20">
                {(fullName || 'AD').substring(0, 2).toUpperCase()}
              </div>
            )}

            <div>
              <div className="text-base font-extrabold text-white">{fullName}</div>
              <div className="text-xs text-slate-400 mt-0.5">{profile?.email}</div>
            </div>

            <div className="pt-3 border-t border-white/10 space-y-2 text-left text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Vai Trò:</span>
                <Badge variant="accent">{profile?.role?.toUpperCase()}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Trạng Thái:</span>
                <Badge variant={profile?.status === 'active' ? 'published' : 'danger'}>
                  {profile?.status === 'active' ? 'Hoạt Động' : 'Tạm Khóa'}
                </Badge>
              </div>
              {profile?.lastLoginAt && (
                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> Đăng nhập:
                  </span>
                  <span>{new Date(profile.lastLoginAt).toLocaleDateString('vi-VN')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Settings Tabs & Forms */}
          <div className="md:col-span-2 space-y-4">
            {/* Tabs Header */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-900/60 rounded-xl border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'info'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <User size={15} /> Thông Tin Cá Nhân
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('password')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold transition-all ${
                  activeTab === 'password'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <KeyRound size={15} /> Đổi Mật Khẩu
              </button>
            </div>

            {/* Tab 1: Profile Info Form */}
            {activeTab === 'info' && (
              <form
                onSubmit={handleUpdateProfile}
                className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4"
              >
                <h3 className="text-sm font-bold text-white mb-2">Thông Tin Cơ Bản</h3>

                {/* Email (Readonly) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                    Địa Chỉ Email (Không thể thay đổi)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail size={16} />
                    </div>
                    <Input
                      type="email"
                      value={profile?.email || ''}
                      disabled
                      className="pl-10 h-11 bg-slate-800/40 opacity-70 cursor-not-allowed"
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
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Số Điện Thoại</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Phone size={16} />
                    </div>
                    <Input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0987.654.321"
                      className="pl-10 h-11"
                    />
                  </div>
                </div>

                {/* Avatar URL */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Ảnh Đại Diện (URL)</label>
                  <Input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="h-11"
                  />
                </div>

                {/* Role (Readonly Badge) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Vai Trò Hệ Thống</label>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-800/40 border border-white/5 text-xs text-slate-300">
                    <Shield size={16} className="text-sky-400" />
                    <span>{getRoleLabel(profile?.role)}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-end">
                  <Button
                    variant="primary"
                    type="submit"
                    isLoading={savingProfile}
                    className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold"
                  >
                    <Save size={15} /> Lưu Thay Đổi
                  </Button>
                </div>
              </form>
            )}

            {/* Tab 2: Change Password Form */}
            {activeTab === 'password' && (
              <form
                onSubmit={handleChangePassword}
                className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl space-y-4"
              >
                <div>
                  <h3 className="text-sm font-bold text-white">Đổi Mật Khẩu Đăng Nhập</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Sau khi đổi mật khẩu, toàn bộ các phiên đăng nhập khác của bạn trên các thiết bị sẽ tự động bị
                    cưỡng chế đăng xuất (R4 Instant Revocation).
                  </p>
                </div>

                {/* Current Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Mật Khẩu Hiện Tại <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock size={16} />
                    </div>
                    <Input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Nhập mật khẩu đang dùng"
                      className="pl-10 pr-10 h-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                    >
                      {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Mật Khẩu Mới <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <KeyRound size={16} />
                    </div>
                    <Input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Tối thiểu 8 ký tự (hoa, thường, số, ký tự đặc biệt)"
                      className="pl-10 pr-10 h-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Xác Nhận Mật Khẩu Mới <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock size={16} />
                    </div>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      className="pl-10 h-11"
                      required
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-end">
                  <Button
                    variant="primary"
                    type="submit"
                    isLoading={changingPassword}
                    className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold"
                  >
                    <Save size={15} /> Cập Nhật Mật Khẩu
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

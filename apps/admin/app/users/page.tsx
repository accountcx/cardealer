'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  ShieldAlert,
  Lock,
  Unlock,
  LogOut,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
} from 'lucide-react';
import { Button, Input, Badge } from '@cardealer/ui';
import { userService } from '../../services/user.service';
import { UserTableSkeleton } from './components/UserTableSkeleton';
import { UserFormModal, type UserFormData } from './components/UserFormModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { canUser } from '../../lib/permissions';
import { useAuth } from '../../contexts/AuthContext';
import { AccessDenied } from '../components/AccessDenied';
import type { UserResponse, Role, UserStatus } from '@cardealer/types';

interface NotificationState {
  type: 'success' | 'error';
  message: string;
}

export default function UsersPage() {
  const { user: authUser, loading: authLoading, can } = useAuth();
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<NotificationState | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [saving, setSaving] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<UserResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Force logout modal state
  const [forceLogoutTarget, setForceLogoutTarget] = useState<UserResponse | null>(null);
  const [forceLoggingOut, setForceLoggingOut] = useState(false);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const loadData = useCallback(async () => {
    // Nếu không có quyền users:read thì bỏ qua gọi API danh sách
    if (!authLoading && !can('users:read')) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [userList, profile] = await Promise.all([
        userService.getUsers(),
        userService.getProfile().catch(() => null),
      ]);
      setUsers(userList || []);
      if (profile) setCurrentUser(profile);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải danh sách tài khoản';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [authLoading, can]);

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [authLoading, loadData]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchRole = selectedRole === 'all' || u.role === selectedRole;
      const matchStatus = selectedStatus === 'all' || u.status === selectedStatus;
      const matchSearch =
        !searchTerm.trim() ||
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase());
      return matchRole && matchStatus && matchSearch;
    });
  }, [users, selectedRole, selectedStatus, searchTerm]);

  // Handle Create / Edit Submit
  const handleFormSubmit = async (data: UserFormData) => {
    try {
      setSaving(true);
      if (editingUser) {
        await userService.updateUser(editingUser.id, {
          fullName: data.fullName,
          phone: data.phone,
          avatarUrl: data.avatarUrl,
          role: data.role,
          status: data.status,
        });
        showNotification('success', 'Cập nhật thông tin nhân viên thành công!');
      } else {
        await userService.createUser({
          email: data.email,
          fullName: data.fullName,
          password: data.password!,
          phone: data.phone,
          avatarUrl: data.avatarUrl,
          role: data.role,
        });
        showNotification('success', 'Tạo tài khoản nhân viên mới thành công!');
      }
      setIsFormModalOpen(false);
      setEditingUser(null);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi lưu thông tin';
      showNotification('error', msg);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  // Handle Quick Status Toggle
  const handleToggleStatus = async (user: UserResponse) => {
    if (currentUser?.id === user.id) {
      showNotification('error', 'Bạn không thể tự khóa tài khoản của chính mình (R2 Protection)');
      return;
    }

    const nextStatus: UserStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      await userService.updateUserStatus(user.id, nextStatus);
      showNotification(
        'success',
        `Đã ${nextStatus === 'active' ? 'kích hoạt' : 'tạm khóa'} tài khoản ${user.fullName} thành công!`
      );
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi thay đổi trạng thái';
      showNotification('error', msg);
    }
  };

  // Handle Force Logout
  const handleConfirmForceLogout = async () => {
    if (!forceLogoutTarget) return;
    try {
      setForceLoggingOut(true);
      await userService.forceLogoutUser(forceLogoutTarget.id);
      showNotification('success', `Đã buộc đăng xuất tài khoản ${forceLogoutTarget.fullName} thành công!`);
      setForceLogoutTarget(null);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi buộc đăng xuất';
      showNotification('error', msg);
    } finally {
      setForceLoggingOut(false);
    }
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await userService.deleteUser(deleteTarget.id);
      showNotification('success', `Đã xóa tài khoản ${deleteTarget.fullName} thành công!`);
      setDeleteTarget(null);
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi xóa nhân viên';
      showNotification('error', msg);
    } finally {
      setDeleting(false);
    }
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'admin':
        return <Badge variant="accent">Quản Trị Viên</Badge>;
      case 'manager':
        return <Badge variant="default">Quản Lý</Badge>;
      case 'editor':
        return <Badge variant="secondary">Biên Tập</Badge>;
      case 'sales':
        return <Badge variant="neutral">Kinh Doanh</Badge>;
      default:
        return <Badge variant="neutral">{role}</Badge>;
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="published">Hoạt Động</Badge>;
      case 'suspended':
        return <Badge variant="danger">Tạm Khóa</Badge>;
      case 'pending':
        return <Badge variant="draft">Chờ Duyệt</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  if (!authLoading && !can('users:read')) {
    return (
      <AccessDenied
        title="Phân Hệ Quản Trị Nhân Sự"
        message="Chỉ Quản Trị Viên (Admin) và Quản Lý (Manager) mới có quyền truy cập danh sách nhân sự và thiết lập phân quyền tài khoản."
        requiredPermission="users:read"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400 mb-1">
            <Users size={14} /> Phân Hệ Quản Trị Hệ Thống
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Tài Khoản & Phân Quyền Nhân Sự</h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý danh sách nhân viên, gán vai trò RBAC và kiểm soát phiên làm việc showroom.
          </p>
        </div>

        {canUser(currentUser, 'users:create') && (
          <Button
            variant="primary"
            onClick={() => {
              setEditingUser(null);
              setIsFormModalOpen(true);
            }}
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 shadow-lg shadow-sky-500/20"
          >
            <UserPlus size={16} /> Thêm Nhân Viên Mới
          </Button>
        )}
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

      {/* 2. Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-xl">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search size={16} />
          </div>
          <Input
            type="text"
            placeholder="Tìm theo họ tên, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 w-full text-xs"
          />
        </div>

        {/* Role & Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-xl border border-white/5 text-xs">
            {['all', 'admin', 'manager', 'editor', 'sales'].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                type="button"
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  selectedRole === role
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                {role === 'all'
                  ? 'Tất Cả'
                  : role === 'admin'
                  ? 'Admin'
                  : role === 'manager'
                  ? 'Quản Lý'
                  : role === 'editor'
                  ? 'Biên Tập'
                  : 'Sales'}
              </button>
            ))}
          </div>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 px-3 rounded-xl bg-slate-800/80 border border-white/10 text-xs text-slate-300 font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/50"
          >
            <option value="all">Trạng Thái: Tất Cả</option>
            <option value="active">Đang Hoạt Động</option>
            <option value="suspended">Tạm Khóa</option>
            <option value="pending">Chờ Duyệt</option>
          </select>

          <Button variant="ghost" size="sm" onClick={loadData} title="Làm mới dữ liệu">
            <RefreshCw size={15} />
          </Button>
        </div>
      </div>

      {/* 3. Main Data Table / 4-State UI */}
      {loading ? (
        <UserTableSkeleton />
      ) : error ? (
        <div className="p-8 text-center rounded-2xl bg-rose-500/5 border border-rose-500/20 text-rose-300 space-y-3">
          <AlertCircle size={32} className="mx-auto text-rose-400" />
          <div className="text-sm font-bold">{error}</div>
          <Button variant="primary" size="sm" onClick={loadData}>
            Thử Lại
          </Button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-white/5 text-slate-400 space-y-3">
          <Users size={36} className="mx-auto text-slate-600" />
          <div className="text-sm font-semibold text-white">Không tìm thấy tài khoản nào phù hợp</div>
          <p className="text-xs text-slate-500">Hãy thử điều chỉnh lại bộ lọc tìm kiếm hoặc vai trò.</p>
          {(searchTerm || selectedRole !== 'all' || selectedStatus !== 'all') && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedRole('all');
                setSelectedStatus('all');
              }}
            >
              Đặt Lại Bộ Lọc
            </Button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-slate-800/50 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="px-5 py-3.5">Nhân Viên</th>
                  <th className="px-5 py-3.5">Vai Trò</th>
                  <th className="px-5 py-3.5">Trạng Thái</th>
                  <th className="px-5 py-3.5">Đăng Nhập Cuối</th>
                  <th className="px-5 py-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user) => {
                  const isSelf = currentUser?.id === user.id;

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Avatar & User Info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.fullName}
                              className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-700 border border-white/10 flex items-center justify-center font-bold text-sky-400 shrink-0">
                              {user.fullName.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <div className="font-bold text-white flex items-center gap-1.5 truncate">
                              <span>{user.fullName}</span>
                              {isSelf && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <div className="text-slate-400 text-[11px] truncate">{user.email}</div>
                            {user.phone && (
                              <div className="text-slate-500 text-[10px] truncate">{user.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4">{getRoleBadge(user.role)}</td>

                      {/* Status */}
                      <td className="px-5 py-4">{getStatusBadge(user.status)}</td>

                      {/* Last Login */}
                      <td className="px-5 py-4 text-slate-400">
                        {user.lastLoginAt ? (
                          <div>
                            <div className="text-slate-300">
                              {new Date(user.lastLoginAt).toLocaleDateString('vi-VN')}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              {new Date(user.lastLoginAt).toLocaleTimeString('vi-VN')}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Chưa đăng nhập</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          {/* Quick Lock / Unlock */}
                          {canUser(currentUser, 'users:update') && !isSelf && (
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(user)}
                              className={`p-2 rounded-lg transition-colors ${
                                user.status === 'active'
                                  ? 'text-slate-400 hover:text-amber-400 hover:bg-amber-400/10'
                                  : 'text-emerald-400 hover:bg-emerald-400/10'
                              }`}
                              title={user.status === 'active' ? 'Tạm khóa tài khoản' : 'Mở khóa tài khoản'}
                            >
                              {user.status === 'active' ? <Lock size={15} /> : <Unlock size={15} />}
                            </button>
                          )}

                          {/* Force Logout */}
                          {canUser(currentUser, 'users:force_logout') && !isSelf && (
                            <button
                              type="button"
                              onClick={() => setForceLogoutTarget(user)}
                              className="p-2 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-400/10 transition-colors"
                              title="Buộc đăng xuất / Thu hồi phiên làm việc tức thì"
                            >
                              <LogOut size={15} />
                            </button>
                          )}

                          {/* Edit */}
                          {canUser(currentUser, 'users:update') && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingUser(user);
                                setIsFormModalOpen(true);
                              }}
                              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                              title="Chỉnh sửa thông tin"
                            >
                              <Edit2 size={15} />
                            </button>
                          )}

                          {/* Delete */}
                          {canUser(currentUser, 'users:delete') && !isSelf && (
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(user)}
                              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 transition-colors"
                              title="Xóa tài khoản nhân viên"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Form Modal (Create / Edit) */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingUser(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingUser}
        loading={saving}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Xác Nhận Xóa Nhân Viên"
        message={`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản của "${deleteTarget?.fullName}" (${deleteTarget?.email}) khỏi hệ thống showroom? Thao tác này sẽ được ghi vào nhật ký kiểm toán.`}
        confirmText="Xác Nhận Xóa"
        variant="danger"
        loading={deleting}
      />

      {/* Force Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(forceLogoutTarget)}
        onClose={() => setForceLogoutTarget(null)}
        onConfirm={handleConfirmForceLogout}
        title="Cưỡng Chế Đăng Xuất"
        message={`Bạn có muốn hủy toàn bộ phiên làm việc của "${forceLogoutTarget?.fullName}" ngay lập tức? Người dùng sẽ bị văng khỏi hệ thống và phải đăng nhập lại.`}
        confirmText="Buộc Đăng Xuất"
        variant="warning"
        loading={forceLoggingOut}
      />
    </div>
  );
}

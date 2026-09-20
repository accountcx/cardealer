'use client';

// 🧠 Mental Model: Trang Quản Trị Khách Hàng & Báo Giá (Leads CRM) chuẩn Hyundai Luxury Dark Theme.
// 1. Phù hợp 100% với Design System của Admin Shell (#0b0f17, glassmorphism, border-white/10, text-white).
// 2. RBAC Guard: Kiểm tra 'leads:read' để truy cập, 'leads:write' để cập nhật trạng thái.
// 3. KPI Cards tương tác: Nhấp trực tiếp vào các thẻ Thống kê để lọc danh sách khách hàng.
// 4. Thao tác siêu tốc: Nút Gọi điện (tel:), Mở Zalo và Sao chép SĐT 1 chạm ngay trên từng hàng bảng.
// 5. Cập nhật trạng thái tức thì (Optimistic UI) cả trực tiếp trên bảng lẫn trong Drawer Chi tiết.

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  Phone,
  MessageCircle,
  Eye,
  Calendar,
  Car,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle2,
  X,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Button, Input, Badge } from '@cardealer/ui';
import { leadService, type LeadListResponse } from '../../services/lead.service';
import { LeadStats, type LeadFilterType } from './components/LeadStats';
import { LeadDetailModal } from './components/LeadDetailModal';
import { useAuth } from '../../contexts/AuthContext';
import { AccessDenied } from '../components/AccessDenied';
import type { LeadStatus } from '@cardealer/types';
import { LEAD_STATUS_LABELS } from '@cardealer/types';

interface ActionNotification {
  type: 'success' | 'error';
  title: string;
  message: string;
}

export default function LeadsManagementPage() {
  const { user, loading: authLoading, can } = useAuth();

  // State Dữ liệu
  const [data, setData] = useState<LeadListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<ActionNotification | null>(null);

  // Bộ lọc & Phân trang
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<LeadFilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Modal Chi Tiết
  const [selectedLead, setSelectedLead] = useState<LeadListResponse['items'][number] | null>(null);
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset về trang 1 khi tìm kiếm
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Tải danh sách Leads từ Server
  const fetchLeads = useCallback(async () => {
    if (!authLoading && !can('leads:read')) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await leadService.getLeads({
        page,
        limit: 20,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: debouncedSearch.trim() || undefined,
      });
      setData(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể kết nối máy chủ để tải danh sách khách hàng';
      setError(msg);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, debouncedSearch, authLoading, can]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Thông báo tạm thời
  const showToast = (type: 'success' | 'error', title: string, message: string) => {
    setNotification({ type, title, message });
    setTimeout(() => setNotification(null), 4500);
  };

  // Sao chép nhanh số điện thoại
  const handleCopyPhone = (id: string, phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedPhoneId(id);
    setTimeout(() => setCopiedPhoneId(null), 2000);
  };

  // Cập nhật trạng thái trực tiếp trên dòng (Optimistic UI)
  const handleInlineStatusChange = async (
    id: string,
    newStatus: LeadStatus,
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    e.stopPropagation();
    if (!can('leads:write')) {
      showToast('error', 'Không có quyền', 'Bạn không có quyền cập nhật trạng thái khách hàng.');
      return;
    }

    const previousData = data;

    // Optimistic Update
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item
        ),
      };
    });

    try {
      await leadService.updateLeadStatus(id, newStatus);
      showToast(
        'success',
        'Cập nhật thành công',
        `Đã chuyển trạng thái lead sang "${LEAD_STATUS_LABELS[newStatus]}".`
      );
    } catch (err: unknown) {
      // Rollback
      setData(previousData);
      const msg = err instanceof Error ? err.message : 'Lỗi kết nối máy chủ khi cập nhật';
      showToast('error', 'Cập nhật thất bại', msg);
    }
  };

  // Cập nhật từ Detail Modal
  const handleModalUpdate = async (id: string, newStatus: LeadStatus, newNotes?: string) => {
    await leadService.updateLeadStatus(id, newStatus, newNotes);
    showToast('success', 'Đã lưu', 'Đã lưu trạng thái và ghi chú tư vấn thành công.');
    fetchLeads();
  };

  // Thống kê đếm số lượng cho KPI Cards
  const statsCounts = useMemo(() => {
    const items = data?.items || [];
    return {
      total: data?.pagination?.total || 0,
      newCount: items.filter((i) => i.status === 'new').length,
      contactedCount: items.filter((i) => i.status === 'contacted').length,
      convertedCount: items.filter((i) => i.status === 'converted').length,
      cancelledCount: items.filter((i) => i.status === 'cancelled').length,
    };
  }, [data]);

  // Kiểm tra quyền RBAC
  if (!authLoading && !can('leads:read')) {
    return (
      <AccessDenied
        title="Phân Hệ Quản Trị Khách Hàng (CRM)"
        message="Chỉ Quản Trị Viên, Quản Lý và Nhân Viên Kinh Doanh mới có quyền truy cập danh sách khách hàng và hồ sơ đăng ký tư vấn."
        requiredPermission="leads:read"
      />
    );
  }

  const renderStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'new':
        return (
          <Badge variant="default" className="flex items-center gap-1.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            Mới Nhận
          </Badge>
        );
      case 'contacted':
        return (
          <Badge variant="accent" className="flex items-center gap-1.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0072CE]" />
            Đang Tư Vấn
          </Badge>
        );
      case 'converted':
        return (
          <Badge variant="published" className="flex items-center gap-1.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Thành Công
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="danger" className="flex items-center gap-1.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Hủy / Sai Số
          </Badge>
        );
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  const leads = data?.items || [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      {/* 1. Header Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400 mb-1">
            <Users size={14} /> Phân Hệ Quản Trị Khách Hàng (CRM)
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Yêu Cầu Báo Giá & Hồ Sơ Vay
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý phễu khách hàng tiềm năng, đăng ký tư vấn giá lăn bánh và bảng tính trả góp từ Showroom.
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={fetchLeads}
          disabled={loading}
          leftIcon={<RefreshCw size={14} className={loading ? 'animate-spin text-sky-400' : ''} />}
          className="text-xs font-semibold px-4 py-2 border-white/10 hover:border-sky-500/40"
        >
          {loading ? 'Đang đồng bộ...' : 'Làm mới dữ liệu'}
        </Button>
      </div>

      {/* 2. Notification Toast Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 shadow-xl transition-all animate-in fade-in slide-in-from-top-2 ${
            notification.type === 'success'
              ? 'bg-emerald-950/50 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/60 border-red-500/50 text-red-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {notification.type === 'success' ? (
              <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle size={20} className="text-red-400 shrink-0" />
            )}
            <div>
              <div className="text-sm font-bold">{notification.title}</div>
              <div className="text-xs opacity-90 mt-0.5">{notification.message}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 3. Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5 min-w-0">
            <AlertCircle size={20} className="text-red-400 shrink-0" />
            <div className="text-sm font-semibold truncate">
              <span className="font-bold text-red-200">Lỗi kết nối API:</span> {error}
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchLeads}
            leftIcon={<RefreshCw size={13} />}
            className="shrink-0 text-xs"
          >
            Thử Lại
          </Button>
        </div>
      )}

      {/* 4. Interactive KPI Cards (LeadStats) */}
      <LeadStats
        total={statsCounts.total}
        newCount={statsCounts.newCount}
        contactedCount={statsCounts.contactedCount}
        convertedCount={statsCounts.convertedCount}
        cancelledCount={statsCounts.cancelledCount}
        activeFilter={statusFilter}
        onFilterChange={(filter) => {
          setStatusFilter(filter);
          setPage(1);
        }}
        isLoading={loading}
      />

      {/* 5. Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="flex-1 w-full">
          <Input
            placeholder="Tìm theo họ tên khách hàng, số điện thoại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search size={16} />}
            className="bg-slate-900/60 border-white/10"
          />
        </div>

        {/* Dropdown Bộ lọc Trạng thái */}
        <div className="w-full sm:w-60">
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as LeadFilterType);
                setPage(1);
              }}
              className="w-full bg-slate-900/80 border border-white/10 text-slate-200 rounded-lg pl-9 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-transparent cursor-pointer transition appearance-none"
            >
              <option value="all">Tất Cả Trạng Thái</option>
              <option value="new">🔴 Mới Nhận (Cần gọi ngay)</option>
              <option value="contacted">🔵 Đang Tư Vấn</option>
              <option value="converted">🟢 Đã Chốt / Thành Công</option>
              <option value="cancelled">⚪ Đã Hủy / Sai Số</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>

        {(searchQuery || statusFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
              setPage(1);
            }}
            className="text-xs text-slate-400 hover:text-white"
          >
            Xóa Lọc
          </Button>
        )}
      </div>

      {/* 6. Luxury Dark Data Table */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-white/[0.04] border-b border-white/10 text-slate-400 text-xs uppercase font-bold tracking-wider">
                <th className="py-3.5 px-4">Khách Hàng</th>
                <th className="py-3.5 px-4">Dòng Xe & Ước Tính</th>
                <th className="py-3.5 px-4">Khu Vực</th>
                <th className="py-3.5 px-4">Trạng Thái</th>
                <th className="py-3.5 px-4">Ghi Chú</th>
                <th className="py-3.5 px-4">Ngày Gửi</th>
                <th className="py-3.5 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              {loading && (!data || leads.length === 0) ? (
                // Skeleton Rows
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-4">
                      <div className="h-4 bg-white/10 rounded w-28 mb-2" />
                      <div className="h-3 bg-white/5 rounded w-20" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-white/10 rounded w-32 mb-1.5" />
                      <div className="h-3 bg-white/5 rounded w-24" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-5 bg-white/10 rounded-full w-16" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-6 bg-white/10 rounded-full w-24" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-white/10 rounded w-36" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 bg-white/10 rounded w-24" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="h-8 bg-white/10 rounded w-20 mx-auto" />
                    </td>
                  </tr>
                ))
              ) : leads.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mb-3">
                        <Users size={28} />
                      </div>
                      <p className="text-base font-semibold text-slate-200">Không tìm thấy khách hàng nào</p>
                      <p className="text-xs text-slate-400 mt-1 text-center">
                        {searchQuery || statusFilter !== 'all'
                          ? 'Thử thay đổi từ khóa tìm kiếm hoặc điều kiện lọc trạng thái.'
                          : 'Chưa có dữ liệu đăng ký báo giá nào được gửi từ Showroom.'}
                      </p>
                      {(searchQuery || statusFilter !== 'all') && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSearchQuery('');
                            setStatusFilter('all');
                            setPage(1);
                          }}
                          className="mt-4 text-xs"
                        >
                          Xóa Tất Cả Bộ Lọc
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                // Data Rows
                leads.map((lead) => {
                  const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
                  const isCopied = copiedPhoneId === lead.id;

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-white/[0.03] transition cursor-pointer group"
                    >
                      {/* 1. Khách Hàng */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white group-hover:text-sky-300 transition">
                          {lead.fullName}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs font-mono text-slate-400">{lead.phone}</span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyPhone(lead.id, lead.phone, e)}
                            title="Sao chép số điện thoại"
                            className="text-slate-500 hover:text-sky-400 p-0.5 rounded transition cursor-pointer"
                          >
                            {isCopied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </td>

                      {/* 2. Dòng Xe & Ước Tính */}
                      <td className="py-3.5 px-4">
                        {lead.carVersion ? (
                          <div>
                            <div className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                              <Car size={13} className="text-sky-400 shrink-0" />
                              {lead.carVersion.car?.tenXe || 'Hyundai'}{' '}
                              <span className="text-slate-400 font-normal">
                                - {lead.carVersion.tenPhienBan}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {lead.estimatedTotal ? (
                                <span className="text-amber-300 font-semibold">
                                  Lăn bánh: {new Intl.NumberFormat('vi-VN').format(lead.estimatedTotal)} ₫
                                </span>
                              ) : (
                                <span>
                                  Niêm yết: {new Intl.NumberFormat('vi-VN').format(lead.carVersion.giaNiemYet)} ₫
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Chưa chọn dòng xe</span>
                        )}
                      </td>

                      {/* 3. Khu Vực */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-white/5">
                          <MapPin size={11} className="text-slate-400" />
                          {lead.province || 'Toàn quốc'}
                        </span>
                      </td>

                      {/* 4. Trạng Thái */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        {can('leads:write') ? (
                          <div className="relative inline-block">
                            <select
                              value={lead.status}
                              onChange={(e) => handleInlineStatusChange(lead.id, e.target.value as LeadStatus, e)}
                              className="bg-slate-800/90 border border-white/10 text-xs font-semibold rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer hover:border-white/20 transition"
                            >
                              <option value="new">🔴 Mới Nhận</option>
                              <option value="contacted">🔵 Đang Tư Vấn</option>
                              <option value="converted">🟢 Thành Công</option>
                              <option value="cancelled">⚪ Đã Hủy</option>
                            </select>
                          </div>
                        ) : (
                          renderStatusBadge(lead.status)
                        )}
                      </td>

                      {/* 5. Ghi Chú */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="text-xs text-slate-300 truncate" title={lead.notes || ''}>
                          {lead.notes ? (
                            lead.notes
                          ) : (
                            <span className="text-slate-600 italic">Chưa có ghi chú</span>
                          )}
                        </div>
                      </td>

                      {/* 6. Ngày Gửi */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-500" />
                          {new Date(lead.createdAt).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[10px] text-slate-500 pl-4.5 mt-0.5">
                          {new Date(lead.createdAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* 7. Thao Tác Nhanh */}
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Nút Gọi Ngay */}
                          <a
                            href={`tel:${cleanPhone}`}
                            title="Gọi điện ngay"
                            className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition"
                          >
                            <Phone size={14} />
                          </a>

                          {/* Nút Nhắn Zalo */}
                          <a
                            href={`https://zalo.me/${cleanPhone}`}
                            target="_blank"
                            rel="noreferrer"
                            title="Mở trò chuyện Zalo"
                            className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400 hover:bg-sky-500/20 transition"
                          >
                            <MessageCircle size={14} />
                          </a>

                          {/* Nút Chi Tiết */}
                          <button
                            type="button"
                            onClick={() => setSelectedLead(lead)}
                            title="Xem chi tiết hồ sơ"
                            className="p-1.5 rounded-lg bg-slate-800 border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition cursor-pointer"
                          >
                            <Eye size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 7. Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-white/[0.02]">
            <div className="text-xs text-slate-400">
              Hiển thị <span className="font-semibold text-slate-200">{leads.length}</span> /{' '}
              <span className="font-semibold text-slate-200">{pagination.total}</span> khách hàng
              (Trang {pagination.page} / {pagination.totalPages})
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="text-xs px-2.5 py-1"
              >
                <ChevronLeft size={14} className="mr-1" /> Trước
              </Button>

              <div className="text-xs font-semibold px-2 text-slate-300">
                {page} / {pagination.totalPages}
              </div>

              <Button
                variant="secondary"
                size="sm"
                disabled={page >= pagination.totalPages || loading}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                className="text-xs px-2.5 py-1"
              >
                Sau <ChevronRight size={14} className="ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 8. Slide-over / Modal Chi Tiết Khách Hàng */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          canEdit={can('leads:write')}
          onClose={() => setSelectedLead(null)}
          onUpdateStatus={handleModalUpdate}
        />
      )}
    </div>
  );
}

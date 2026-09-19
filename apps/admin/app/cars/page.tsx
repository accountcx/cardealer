'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, AlertCircle, RefreshCw, CheckCircle2, X } from 'lucide-react';
import { Button, Input, Card } from '@cardealer/ui';
import { catalogService } from '../../services/catalog.service';
import { CarStats, CarFilterStatus } from './components/CarStats';
import { CarTable, CarItem } from './components/CarTable';
import { CarFormModal, CarFormData } from './components/CarFormModal';
import { ConfirmModal } from '../components/ConfirmModal';

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// 🧠 Mental Model: Quản trị danh mục xe Showroom Hyundai (Container Pattern).
// Tuyệt đối KHÔNG giấu lỗi hay nuốt lỗi. Khi thao tác xóa hoặc tải dữ liệu gặp sự cố, 
// thông báo lỗi chi tiết phải hiển thị rõ ràng trên UI để quản trị viên nắm rõ nguyên nhân.

interface ActionNotification {
  type: 'success' | 'error';
  title: string;
  message: string;
}



export default function CarsManagementPage() {
  const [cars, setCars] = useState<CarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionNotification, setActionNotification] = useState<ActionNotification | null>(null);
  const [search, setSearch] = useState('');
  const [selectedSegment, setSelectedSegment] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<CarFilterStatus>('all');
  const [deleteTarget, setDeleteTarget] = useState<CarItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // State Modal Thêm Dòng Xe Mới
  const [isAddingCar, setIsAddingCar] = useState(false);
  const [savingCar, setSavingCar] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchCars = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await catalogService.getCars();
      if (Array.isArray(data)) {
        const mapped: CarItem[] = data.map((item) => ({
          id: item.id,
          tenXe: item.tenXe,
          slug: item.slug,
          anhDaiDienUrl: item.anhDaiDienUrl || '/images/cars/tucson-2025.webp',
          segment: item.segment || 'suv',
          traTruocTu: item.traTruocTu ? Number(item.traTruocTu) : undefined,
          promotionSummary: item.promotionSummary || undefined,
          minPrice: item.minPrice,
          maxPrice: item.maxPrice,
          versionCount: item.versionCount,
          status: item.status === 'draft' ? 'draft' : 'published',
          isFeatured: item.isFeatured,
        }));
        setCars(mapped);
      } else {
        setCars([]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể kết nối đến máy chủ API để lấy danh mục xe';
      setError(msg);
      setCars([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const handleRequestDelete = (id: string) => {
    const carToDelete = cars.find((c) => c.id === id);
    if (carToDelete) {
      setDeleteTarget(carToDelete);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      setActionNotification(null);
      await catalogService.deleteCar(deleteTarget.id);
      setCars((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      setActionNotification({
        type: 'success',
        title: 'Xóa thành công',
        message: `Đã xóa hoàn toàn dòng xe "${deleteTarget.tenXe}" khỏi cơ sở dữ liệu.`,
      });
      setTimeout(() => setActionNotification(null), 4000);
      setDeleteTarget(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi không xác định khi kết nối máy chủ.';
      setActionNotification({
        type: 'error',
        title: 'Thao tác xóa thất bại',
        message: `Không thể xóa dòng xe "${deleteTarget.tenXe}": ${msg}`,
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateCar = async (data: CarFormData) => {
    try {
      setSavingCar(true);
      setModalError(null);

      const trimmedName = data.tenXe.trim();
      const slug = data.slug.trim();

      const payload = {
        tenXe: trimmedName,
        slug,
        segment: data.segment,
        anhDaiDienUrl: data.anhDaiDienUrl?.trim() || `/images/cars/${slug}.webp`,
        traTruocTu: data.traTruocTu ? Number(data.traTruocTu) : null,
        promotionSummary: data.promotionSummary?.trim() || null,
        moTaChung: data.moTaChung?.trim() || null,
        status: data.status,
        isFeatured: data.isFeatured,
        versions: data.giaKhoiDiem
          ? [
              {
                tenPhienBan: `${trimmedName} Tiêu Chuẩn`,
                slug: `${slug}-tieu-chuan`,
                giaNiemYet: Number(data.giaKhoiDiem),
                seatCount: data.segment === 'mpv' ? 7 : 5,
              },
            ]
          : [],
      };

      await catalogService.createCar(payload);
      await fetchCars();
      setIsAddingCar(false);
      setActionNotification({
        type: 'success',
        title: 'Tạo dòng xe thành công',
        message: `Đã thêm mới dòng xe "${trimmedName}" vào hệ thống. Bạn có thể nhấn Sửa để cấu hình thêm phiên bản và bảng màu.`,
      });
      setTimeout(() => setActionNotification(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi không xác định khi tạo dòng xe lên máy chủ.';
      setModalError(msg);
    } finally {
      setSavingCar(false);
    }
  };

  // 🧠 Mental Model: Chuyển đổi trạng thái nhanh (Quick Status Toggle) giữa 'published' và 'draft'.
  // Áp dụng cơ chế Optimistic UI: Cập nhật giao diện tức thì để mang lại trải nghiệm mượt mà,
  // đồng thời gọi PUT /api/admin/cars/:id. Nếu server trả lỗi, tự động rollback và hiển thị thông báo.
  const handleToggleStatus = async (car: CarItem) => {
    const nextStatus: 'published' | 'draft' = car.status === 'published' ? 'draft' : 'published';
    const prevStatus = car.status;

    // Optimistic UI update
    setCars((prev) =>
      prev.map((c) => (c.id === car.id ? { ...c, status: nextStatus } : c))
    );

    try {
      await catalogService.updateCar(car.id, { status: nextStatus });
      setActionNotification({
        type: 'success',
        title: 'Cập nhật trạng thái thành công',
        message: `Đã chuyển dòng xe "${car.tenXe}" sang trạng thái "${
          nextStatus === 'published' ? 'Đang Bán (Công khai)' : 'Bản Nháp / Ẩn'
        }".`,
      });
      setTimeout(() => setActionNotification(null), 4000);
    } catch (err: unknown) {
      // Rollback on error
      setCars((prev) =>
        prev.map((c) => (c.id === car.id ? { ...c, status: prevStatus } : c))
      );
      const msg = err instanceof Error ? err.message : 'Lỗi kết nối máy chủ khi cập nhật trạng thái.';
      setActionNotification({
        type: 'error',
        title: 'Cập nhật trạng thái thất bại',
        message: `Không thể đổi trạng thái cho "${car.tenXe}": ${msg}`,
      });
    }
  };

  const filteredCars = cars.filter((c) => {
    const matchSearch = c.tenXe.toLowerCase().includes(search.toLowerCase()) || c.slug.includes(search.toLowerCase());
    const matchSegment = selectedSegment === 'all' || c.segment === selectedSegment;
    const matchStatus =
      selectedStatus === 'all'
        ? true
        : selectedStatus === 'featured'
        ? c.isFeatured
        : c.status === selectedStatus;
    return matchSearch && matchSegment && matchStatus;
  });

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-100 tracking-tight">
            Quản Lý Dòng Xe Hyundai
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Thiết lập danh mục sản phẩm, phiên bản và bảng màu cho Showroom Hyundai Vinh
          </p>
        </div>

        <Button
          variant="accent"
          glow
          leftIcon={<Plus size={16} />}
          onClick={() => {
            setModalError(null);
            setIsAddingCar(true);
          }}
        >
          Thêm Dòng Xe Mới
        </Button>
      </div>

      {/* Action Notification Banner (Xóa / Cập nhật) */}
      {actionNotification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 shadow-lg transition-all animate-in fade-in ${
            actionNotification.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/50 border-red-500/50 text-red-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {actionNotification.type === 'success' ? (
              <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle size={20} className="text-red-400 shrink-0" />
            )}
            <div>
              <div className="text-sm font-bold">{actionNotification.title}</div>
              <div className="text-xs opacity-90 mt-0.5">{actionNotification.message}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActionNotification(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Error Alert if Initial API Fetch Fails */}
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
            onClick={fetchCars}
            leftIcon={<RefreshCw size={13} />}
            className="shrink-0 text-xs"
          >
            Thử Lại
          </Button>
        </div>
      )}

      {/* KPI Stats Component */}
      <CarStats
        total={cars.length}
        published={cars.filter((c) => c.status === 'published').length}
        draft={cars.filter((c) => c.status === 'draft').length}
        featured={cars.filter((c) => c.isFeatured).length}
        activeFilter={selectedStatus}
        onFilterChange={setSelectedStatus}
        isLoading={loading}
      />

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <div className="flex-1 w-full">
          <Input
            placeholder="Tìm theo tên xe hoặc slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={16} />}
          />
        </div>

        {/* Bộ lọc Trạng thái */}
        <div className="w-full sm:w-56">
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as CarFilterStatus)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-900/80 border border-slate-700/60 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0072CE] transition-colors"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="published">Đang Bán (Công khai)</option>
              <option value="draft">Bản Nháp / Ẩn</option>
              <option value="featured">Xe Bán Chạy / Hot</option>
            </select>
          </div>
        </div>

        {/* Bộ lọc Phân khúc */}
        <div className="w-full sm:w-56">
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={selectedSegment}
              onChange={(e) => setSelectedSegment(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-900/80 border border-slate-700/60 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0072CE] transition-colors"
            >
              <option value="all">Tất cả phân khúc</option>
              <option value="suv">SUV / Crossover</option>
              <option value="sedan">Sedan</option>
              <option value="hatchback">Hatchback</option>
              <option value="mpv">MPV</option>
              <option value="ev">Xe Điện (EV)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      <Card variant="glass" className="overflow-hidden">
        {error && !loading && cars.length === 0 ? (
          <div className="p-12 text-center text-red-300 text-sm">
            Không thể tải dữ liệu xe do lỗi máy chủ. Vui lòng nhấn &quot;Thử Lại&quot; ở trên.
          </div>
        ) : (
          <CarTable
            cars={filteredCars}
            isLoading={loading}
            onDelete={handleRequestDelete}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </Card>

      {/* Hộp thoại Popup Xác Nhận Xóa Dòng Xe */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Xác nhận xóa dòng xe"
        message={`Bạn có chắc chắn muốn xóa dòng xe "${deleteTarget?.tenXe}"? Toàn bộ các phiên bản con và cấu hình màu liên quan sẽ bị xóa vĩnh viễn khỏi cơ sở dữ liệu.`}
        confirmText="Xóa dòng xe"
        cancelText="Hủy bỏ"
      />

      {/* Modal Thêm Dòng Xe Mới Ghép Nối Trực Tiếp API */}
      <CarFormModal
        isOpen={isAddingCar}
        onClose={() => setIsAddingCar(false)}
        onSave={handleCreateCar}
        saving={savingCar}
        errorMessage={modalError}
      />
    </div>
  );
}

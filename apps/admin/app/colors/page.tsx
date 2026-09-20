'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, AlertCircle, RefreshCw, CheckCircle2, X } from 'lucide-react';
import { Button, Input, Skeleton } from '@cardealer/ui';
import { colorService } from '../../services/color.service';
import { ColorCard, ColorItem } from './components/ColorCard';
import { ColorFormModal, ColorFormData } from './components/ColorFormModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { useAuth } from '../../contexts/AuthContext';
import { AccessDenied } from '../components/AccessDenied';

// 🧠 Mental Model: Quản trị Bảng màu Master toàn hệ thống Hyundai (SCHEMA.md).
// Tuyệt đối KHÔNG giấu lỗi hay nuốt lỗi. Khi lưu, sửa, hoặc xóa màu gặp sự cố,
// thông báo lỗi chi tiết phải hiển thị rõ ràng trên UI để quản trị viên nắm rõ nguyên nhân.

interface ActionNotification {
  type: 'success' | 'error';
  title: string;
  message: string;
}

export default function ColorsPage() {
  const { loading: authLoading, can } = useAuth();
  const [colors, setColors] = useState<ColorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionNotification, setActionNotification] = useState<ActionNotification | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ColorItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formData, setFormData] = useState({
    tenMau: '',
    hexCode: '#0072CE',
    isTwoTone: false,
    secondaryHexCode: '#000000',
    swatchUrl: '',
  });

  const loadColors = useCallback(async () => {
    if (!authLoading && !can('cars:write')) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await colorService.getColors();
      if (Array.isArray(data)) {
        setColors(data);
      } else {
        setColors([]);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể kết nối đến máy chủ API để lấy bảng màu';
      setError(msg);
      setColors([]);
    } finally {
      setLoading(false);
    }
  }, [authLoading, can]);

  useEffect(() => {
    if (!authLoading) {
      loadColors();
    }
  }, [authLoading, loadColors]);

  const resetForm = () => {
    setFormData({
      tenMau: '',
      hexCode: '#0072CE',
      isTwoTone: false,
      secondaryHexCode: '#000000',
      swatchUrl: '',
    });
    setEditingId(null);
    setIsAddingNew(false);
  };

  const handleStartEdit = (item: ColorItem) => {
    setEditingId(item.id);
    setIsAddingNew(false);
    setFormData({
      tenMau: item.tenMau,
      hexCode: item.hexCode,
      isTwoTone: item.isTwoTone,
      secondaryHexCode: item.secondaryHexCode || '#000000',
      swatchUrl: item.swatchUrl || '',
    });
  };

  const handleSave = async (data: ColorFormData) => {
    if (!data.tenMau.trim()) return;
    setSaving(true);
    setActionNotification(null);

    try {
      if (editingId) {
        await colorService.updateColor(editingId, {
          tenMau: data.tenMau,
          hexCode: data.hexCode,
          isTwoTone: data.isTwoTone,
          secondaryHexCode: data.isTwoTone ? data.secondaryHexCode : null,
          swatchUrl: data.swatchUrl || null,
        });
      } else {
        await colorService.createColor({
          tenMau: data.tenMau,
          hexCode: data.hexCode,
          isTwoTone: data.isTwoTone,
          secondaryHexCode: data.isTwoTone ? data.secondaryHexCode : null,
          swatchUrl: data.swatchUrl || null,
        });
      }
      await loadColors();
      const savedName = data.tenMau;
      resetForm();
      setActionNotification({
        type: 'success',
        title: editingId ? 'Cập nhật mã màu thành công' : 'Thêm mã màu thành công',
        message: `Mã màu "${savedName}" đã được lưu vào cơ sở dữ liệu.`,
      });
      setTimeout(() => setActionNotification(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể lưu mã màu lên cơ sở dữ liệu';
      setActionNotification({
        type: 'error',
        title: editingId ? 'Cập nhật mã màu thất bại' : 'Thêm mã màu thất bại',
        message: `Không thể lưu mã màu "${data.tenMau}": ${msg}`,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRequestDelete = (id: string) => {
    const colorToDelete = colors.find((c) => c.id === id);
    if (colorToDelete) {
      setDeleteTarget(colorToDelete);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      setActionNotification(null);
      await colorService.deleteColor(deleteTarget.id);
      await loadColors();
      if (editingId === deleteTarget.id) resetForm();
      setActionNotification({
        type: 'success',
        title: 'Xóa mã màu thành công',
        message: `Đã xóa mã màu "${deleteTarget.tenMau}" khỏi hệ thống.`,
      });
      setTimeout(() => setActionNotification(null), 4000);
      setDeleteTarget(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể xóa mã màu trên máy chủ';
      setActionNotification({
        type: 'error',
        title: 'Thao tác xóa thất bại',
        message: `Không thể xóa mã màu "${deleteTarget.tenMau}": ${msg}`,
      });
    } finally {
      setDeleting(false);
    }
  };

  const filteredColors = colors.filter(
    (c) =>
      c.tenMau.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.hexCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!authLoading && !can('cars:write')) {
    return (
      <AccessDenied
        title="Quản Trị Bảng Màu Ngoại Thất"
        message="Chỉ Quản Trị Viên (Admin), Quản Lý (Manager) và Biên Tập Viên (Editor) mới có quyền truy cập và chỉnh sửa bảng màu chính hãng."
        requiredPermission="cars:write"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">
            Bảng Màu Ngoại Thất
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Quản lý tập trung các màu sơn chính hãng và màu Phối Hai Tông (Two-Tone) cho toàn bộ dòng xe Hyundai
          </p>
        </div>

        <Button
          variant="accent"
          glow
          leftIcon={<Plus size={16} />}
          onClick={() => {
            resetForm();
            setIsAddingNew(true);
          }}
        >
          Thêm Mã Màu
        </Button>
      </div>

      {/* Action Notification Banner (Lưu / Xóa / Lỗi) */}
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

      {/* Error Alert if Initial API Load Fails */}
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
            onClick={loadColors}
            leftIcon={<RefreshCw size={13} />}
            className="shrink-0 text-xs"
          >
            Thử Lại
          </Button>
        </div>
      )}

      {/* Search Bar */}
      <div className="max-w-md">
        <Input
          placeholder="Tìm kiếm màu sắc theo tên hoặc mã hex..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          leftIcon={<Search size={16} />}
        />
      </div>

      {/* Color Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-lg flex flex-col justify-between"
            >
              <div>
                {/* Paint Swatch Skeleton */}
                <Skeleton className="h-28 w-full rounded-none border-b border-white/5" />

                {/* Info Skeleton */}
                <div className="p-4 space-y-2.5">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-6 w-28 rounded-lg" />
                </div>
              </div>

              {/* Action Buttons Skeleton */}
              <div className="p-4 pt-0 mt-2 flex items-center justify-end gap-2 border-t border-white/5 pt-3">
                <Skeleton className="h-7 w-14 rounded-lg" />
                <Skeleton className="h-7 w-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : error && colors.length === 0 ? (
        <div className="p-16 text-center text-red-300 text-sm">
          Không thể tải bảng màu do lỗi máy chủ. Vui lòng nhấn &quot;Thử Lại&quot; ở trên.
        </div>
      ) : filteredColors.length === 0 ? (
        <div className="p-16 text-center text-slate-500 text-sm bg-slate-900/40 rounded-2xl border border-white/5">
          {searchTerm ? 'Không tìm thấy màu sắc nào phù hợp với từ khóa.' : 'Chưa có mã màu nào trong hệ thống.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredColors.map((color) => (
            <ColorCard
              key={color.id}
              color={color}
              onEdit={handleStartEdit}
              onDelete={handleRequestDelete}
            />
          ))}
        </div>
      )}

      {/* Popup Modal Thêm / Chỉnh Sửa Mã Màu */}
      <ColorFormModal
        isOpen={isAddingNew || editingId !== null}
        editingId={editingId}
        formData={formData}
        isSaving={saving}
        onCancel={resetForm}
        onSave={handleSave}
      />

      {/* Hộp thoại Popup Xác Nhận Xóa Mã Màu */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Xác nhận xóa mã màu"
        message={`Bạn có chắc chắn muốn xóa mã màu "${deleteTarget?.tenMau}"? Toàn bộ liên kết màu của các phiên bản xe sử dụng mã màu này sẽ bị hủy bỏ và không thể hoàn tác.`}
        confirmText="Xác nhận xóa"
        cancelText="Hủy bỏ"
      />
    </div>
  );
}

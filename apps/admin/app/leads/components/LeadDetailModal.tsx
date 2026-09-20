'use client';

// 🧠 Mental Model: Modal / Drawer Chi Tiết Khách Hàng (Leads Detail) chuẩn Luxury Automotive Dark Theme.
// 1. Phù hợp 100% với giao diện Admin Shell (#0b0f17, text-white, border-white/10).
// 2. Tương tác nhanh: Nút Gọi điện, Mở Zalo và Sao chép SĐT 1 chạm.
// 3. Phân quyền: Nếu user không có quyền 'leads:write', form cập nhật trạng thái sẽ tự động ẩn hoặc bị vô hiệu hóa.

import React, { useState } from 'react';
import {
  X,
  Phone,
  MessageCircle,
  Copy,
  Check,
  Calendar,
  MapPin,
  Car,
  Clock,
  FileText,
  DollarSign,
  Save,
} from 'lucide-react';
import { Button, Badge } from '@cardealer/ui';
import type { LeadStatus } from '@cardealer/types';
import { LEAD_STATUS_LABELS } from '@cardealer/types';

interface LeadDetailModalProps {
  lead: {
    id: string;
    fullName: string;
    phone: string;
    province: string;
    estimatedTotal?: number | null;
    status: LeadStatus;
    notes?: string | null;
    metadata?: Record<string, unknown> | null;
    createdAt: string;
    updatedAt: string;
    carVersion?: {
      tenPhienBan: string;
      giaNiemYet: number;
      car?: {
        tenXe: string;
      };
    };
  } | null;
  canEdit?: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: LeadStatus, newNotes?: string) => Promise<void>;
}

export function LeadDetailModal({
  lead,
  canEdit = true,
  onClose,
  onUpdateStatus,
}: LeadDetailModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus>(lead?.status || 'new');
  const [newNote, setNewNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!lead) return null;

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(lead.phone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;

    setIsSaving(true);
    try {
      await onUpdateStatus(lead.id, selectedStatus, newNote.trim() || undefined);
      setNewNote('');
      onClose();
    } catch {
      alert('Không thể lưu thông tin. Vui lòng thử lại!');
    } finally {
      setIsSaving(false);
    }
  };

  const cleanPhone = lead.phone.replace(/\D/g, '');
  const carTitle = lead.carVersion?.car?.tenXe
    ? `${lead.carVersion.car.tenXe} (${lead.carVersion.tenPhienBan})`
    : (lead.metadata?.carModel as string) || 'Chưa chọn dòng xe';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl h-full bg-slate-900 border-l border-white/10 shadow-2xl flex flex-col text-slate-100 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-slate-900/80">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
              Chi Tiết Khách Hàng Tiềm Năng
            </span>
            <h2 className="text-xl font-extrabold text-white mt-0.5">{lead.fullName}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Quick Contact Box */}
          <div className="p-4 rounded-xl border border-sky-500/20 bg-sky-500/5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium">Số điện thoại liên hệ:</span>
                <div className="text-xl font-black text-white mt-0.5">{lead.phone}</div>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCopyPhone}
                leftIcon={copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                className="text-xs border-white/10 bg-slate-800 hover:bg-slate-750"
              >
                {copied ? 'Đã chép' : 'Sao chép'}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-sky-500/15">
              <a
                href={`tel:${cleanPhone}`}
                className="py-2 px-3 rounded-lg bg-[#0072CE] hover:bg-[#005fb0] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition"
              >
                <Phone size={14} /> Gọi Điện Thoại
              </a>
              <a
                href={`https://zalo.me/${cleanPhone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition"
              >
                <MessageCircle size={14} /> Nhắn Tin Zalo
              </a>
            </div>
          </div>

          {/* Vehicle & Consultation Request Summary */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Car size={14} className="text-sky-400" /> Yêu Cầu Dự Toán & Quan Tâm
            </h3>
            <div className="p-4 rounded-xl bg-slate-800/60 border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Dòng xe:</span>
                <span className="font-bold text-white text-sm">{carTitle}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Nơi đăng ký biển số:</span>
                <span className="font-semibold text-slate-200 flex items-center gap-1">
                  <MapPin size={12} className="text-sky-400" /> {lead.province}
                </span>
              </div>
              {lead.estimatedTotal && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Dự toán tổng lăn bánh:</span>
                  <span className="font-extrabold text-[#0072CE] text-sm">
                    {Number(lead.estimatedTotal).toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
              )}
              {Boolean(lead.metadata?.leadType) && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Hình thức phễu:</span>
                  <Badge variant="accent" size="sm">
                    {String(lead.metadata?.leadType)}
                  </Badge>
                </div>
              )}
              {Boolean(lead.metadata?.preferredTime) && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Giờ tiện gọi điện:</span>
                  <span className="font-medium text-slate-200 flex items-center gap-1">
                    <Clock size={12} className="text-amber-400" /> {String(lead.metadata?.preferredTime)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center border-t border-white/5 pt-2">
                <span className="text-slate-400">Thời gian tiếp nhận:</span>
                <span className="text-slate-400">
                  {new Date(lead.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>
            </div>
          </div>

          {/* Consultation Notes History */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText size={14} className="text-sky-400" /> Nhật Ký Tư Vấn (Sales Notes)
            </h3>
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/10 min-h-[90px] max-h-48 overflow-y-auto">
              {lead.notes ? (
                <pre className="text-xs text-slate-300 font-sans whitespace-pre-wrap leading-relaxed">
                  {lead.notes}
                </pre>
              ) : (
                <span className="text-xs text-slate-500 italic">Chưa có ghi chú trao đổi nào.</span>
              )}
            </div>
          </div>

          {/* Edit Form (Only for Users with leads:write) */}
          {canEdit && (
            <form onSubmit={handleSave} className="space-y-3.5 pt-2 border-t border-white/10">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Cập nhật trạng thái khách hàng:
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as LeadStatus)}
                  className="w-full p-2.5 bg-slate-800 border border-white/10 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-sky-500 outline-none"
                >
                  {(['new', 'contacted', 'converted', 'cancelled'] as const).map((s) => (
                    <option key={s} value={s}>
                      {LEAD_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Thêm ghi chú cuộc gọi mới:
                </label>
                <textarea
                  rows={3}
                  placeholder="Ghi lại nhu cầu của khách (gói vay, màu xe mong muốn, thời gian hẹn lái thử)..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full p-3 bg-slate-800 border border-white/10 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSaving}
                leftIcon={<Save size={14} />}
                className="w-full bg-[#0072CE] hover:bg-[#005fb0] font-bold text-xs py-3"
              >
                {isSaving ? 'Đang lưu thông tin...' : 'LƯU CẬP NHẬT TRẠNG THÁI & GHI CHÚ'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

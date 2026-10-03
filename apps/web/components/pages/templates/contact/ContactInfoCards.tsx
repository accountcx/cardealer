'use client';

import React from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';
import type { BulkSettings } from '@cardealer/types';
import type { AutoDealerInfo } from '@cardealer/core';

export interface ContactInfoCardsProps {
  showroomName: string;
  address: string;
  phone: string;
  cleanPhone: string;
  email: string;
  settings?: BulkSettings;
}

// WHY: Thẻ hiển thị thông tin Chuyên viên tư vấn & Showroom NAP.
// Tách từ ContactTemplate để tuân thủ quy tắc unit_size_limit (< 300 dòng).
export function ContactInfoCards({
  showroomName,
  address,
  phone,
  cleanPhone,
  email,
  settings,
}: ContactInfoCardsProps) {
  const sellerName = settings?.contact?.sellerName || settings?.floatingSeller?.sellerName || '';
  const sellerPhone = settings?.contact?.sellerPhone || settings?.floatingSeller?.sellerPhone || phone;
  const cleanSellerPhone = sellerPhone.replace(/[^0-9+]/g, '');
  const sellerZalo = settings?.contact?.sellerZalo || settings?.floatingSeller?.sellerZalo || `https://zalo.me/${cleanSellerPhone}`;
  const sellerAvatar = settings?.contact?.sellerAvatar || settings?.floatingSeller?.sellerAvatar || '';

  return (
    <div className="space-y-6">
      {/* Card Chuyên viên tư vấn */}
      {sellerName && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-blue-950 text-white shadow-md space-y-4">
          <div className="flex items-center gap-4">
            {sellerAvatar ? (
              <img
                src={sellerAvatar}
                alt={sellerName}
                className="w-14 h-14 rounded-full object-cover border-2 border-blue-400 shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xl text-white shrink-0">
                {sellerName.charAt(0)}
              </div>
            )}
            <div>
              <span className="text-[11px] uppercase tracking-wider text-blue-300 font-semibold block">
                Chuyên Viên Tư Vấn
              </span>
              <h3 className="text-lg font-bold">{sellerName}</h3>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex flex-wrap gap-2">
            {sellerPhone && (
              <a
                href={`tel:${cleanSellerPhone}`}
                className="flex-1 py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition"
              >
                <Phone size={13} /> Gọi Tư Vấn
              </a>
            )}
            {sellerZalo && (
              <a
                href={sellerZalo}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-white/10"
              >
                <MessageCircle size={13} /> Nhắn Zalo
              </a>
            )}
          </div>
        </div>
      )}

      {/* Card Thông tin Showroom */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
          {showroomName}
        </h2>

        <div className="space-y-4 text-xs text-slate-700">
          {address && (
            <div className="flex items-start gap-3">
              <MapPin className="text-blue-600 shrink-0 mt-0.5" size={18} />
              <div>
                <span className="font-bold block text-slate-900 text-sm">Địa Chỉ Showroom</span>
                <span>{address}</span>
              </div>
            </div>
          )}

          {phone && (
            <div className="flex items-start gap-3">
              <Phone className="text-blue-600 shrink-0 mt-0.5" size={18} />
              <div>
                <span className="font-bold block text-slate-900 text-sm">Hotline Kinh Doanh</span>
                <a href={`tel:${cleanPhone}`} className="text-blue-600 font-semibold hover:underline">
                  {phone}
                </a>
              </div>
            </div>
          )}

          {email && (
            <div className="flex items-start gap-3">
              <Mail className="text-blue-600 shrink-0 mt-0.5" size={18} />
              <div>
                <span className="font-bold block text-slate-900 text-sm">Hòm Thư Điện Tử</span>
                <a href={`mailto:${email}`} className="text-slate-700 hover:text-blue-600">
                  {email}
                </a>
              </div>
            </div>
          )}

          {settings?.contact?.hotlineDichVu && (
            <div className="flex items-start gap-3">
              <Clock className="text-blue-600 shrink-0 mt-0.5" size={18} />
              <div>
                <span className="font-bold block text-slate-900 text-sm">Hotline Dịch Vụ</span>
                <a
                  href={`tel:${settings.contact.hotlineDichVu.replace(/[^0-9+]/g, '')}`}
                  className="text-slate-700 hover:text-blue-600"
                >
                  {settings.contact.hotlineDichVu}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

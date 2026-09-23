'use client';

import React, { useState, useMemo } from 'react';
import type { CarDetailVersion } from '@cardealer/types';
import { SlidersHorizontal } from 'lucide-react';

interface DynamicSpecsTableProps {
  versions: CarDetailVersion[];
  selectedVersionId: string;
}

/**
 * 🧠 Mental Model: Bảng thông số kỹ thuật động theo từng phiên bản (DynamicSpecsTable).
 * - Tự động cập nhật thông số tương ứng với phiên bản xe khách hàng đang chọn.
 * - Hỗ trợ công tắc "Chỉ xem điểm khác biệt" (Highlight Differences Toggle):
 *   Tự động so sánh giá trị thông số giữa các phiên bản xe và chỉ giữ lại các dòng có sự khác biệt,
 *   giúp khách hàng và Saler dễ dàng tư vấn sự chênh lệch trang bị giữa bản Tiêu chuẩn và Cao cấp.
 * - Thiết kế Tab nhóm theo nhóm kỹ thuật (Động cơ, Kích thước, Nội thất, An toàn).
 */
export function DynamicSpecsTable({
  versions,
  selectedVersionId,
}: DynamicSpecsTableProps) {
  const [onlyDiff, setOnlyDiff] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const selectedVer = useMemo(
    () => versions.find((v) => v.id === selectedVersionId) || versions[0],
    [versions, selectedVersionId]
  );

  // Kiểm tra nếu toàn bộ danh sách phiên bản chưa có dữ liệu specGroups thì ẩn hoàn toàn component
  const hasAnySpecs = versions.some((v) => v.specGroups && v.specGroups.length > 0);

  const specGroups = selectedVer?.specGroups || [];

  // Logic lọc các thông số có sự khác biệt giữa các phiên bản
  const processedGroups = useMemo(() => {
    if (!onlyDiff || versions.length <= 1) {
      return specGroups;
    }

    return specGroups
      .map((group) => {
        const filteredSpecs = group.specs.filter((spec) => {
          // Kiểm tra giá trị của thông số này trên tất cả phiên bản
          const values = versions.map((v) => {
            const vGroup = v.specGroups?.find((g) => g.groupName === group.groupName);
            const vSpec = vGroup?.specs.find((s) => s.label === spec.label);
            return vSpec?.value?.trim().toLowerCase() || '';
          });

          // Có ít nhất 1 phiên bản có giá trị khác với phiên bản đầu tiên
          const hasDifference = values.some((val) => val !== values[0]);
          return hasDifference;
        });

        return {
          ...group,
          specs: filteredSpecs,
        };
      })
      .filter((group) => group.specs.length > 0);
  }, [specGroups, onlyDiff, versions]);

  const currentGroup = processedGroups[activeTab] || processedGroups[0];

  if (!hasAnySpecs || specGroups.length === 0) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header & Toggle Nút Gạt */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">
            Thông Số Kỹ Thuật Chi Tiết
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Đang hiển thị theo phiên bản:{' '}
            <span className="font-bold text-blue-600">
              {selectedVer?.tenPhienBan || 'Đang cập nhật'}
            </span>
          </p>
        </div>

        {/* Nút công tắc: Chỉ xem điểm khác biệt */}
        {versions.length > 1 && (
          <label className="inline-flex items-center gap-3 cursor-pointer self-start sm:self-auto select-none bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl hover:bg-slate-100 transition-colors">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
              Chỉ xem điểm khác biệt
            </span>
            <input
              type="checkbox"
              checked={onlyDiff}
              onChange={(e) => setOnlyDiff(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 relative" />
          </label>
        )}
      </div>

      {/* Tabs Nhóm Thông Số */}
      {processedGroups.length > 0 ? (
        <div className="space-y-6">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {processedGroups.map((group, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  (activeTab >= processedGroups.length ? 0 : activeTab) === idx
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {group.groupName}
              </button>
            ))}
          </div>

          {/* Bảng Chi Tiết Thông Số Của Tab */}
          {currentGroup && currentGroup.specs.length > 0 ? (
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
              {currentGroup.specs.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  className={`grid grid-cols-2 sm:grid-cols-3 p-3.5 sm:p-4 text-xs sm:text-sm ${
                    itemIdx % 2 === 0 ? 'bg-slate-50/50' : 'bg-white'
                  }`}
                >
                  <span className="font-medium text-slate-600 sm:col-span-1">{item.label}</span>
                  <span className="font-bold text-slate-900 sm:col-span-2 text-right sm:text-left">
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-sm text-slate-500 bg-slate-50 rounded-2xl">
              Không có sự khác biệt nào giữa các phiên bản trong nhóm thông số này.
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-sm text-slate-500">
          {onlyDiff
            ? 'Tất cả phiên bản đều có thông số tương đương nhau trong danh mục này.'
            : 'Đang cập nhật bảng thông số kỹ thuật cho phiên bản này.'}
        </div>
      )}
    </div>
  );
}

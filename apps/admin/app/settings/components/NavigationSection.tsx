'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Save, Check, ExternalLink, ChevronDown, MoveDown, MoveUp } from 'lucide-react';
import { Button, Card } from '@cardealer/ui';
import type { NavigationSettings, NavLink, NavSubLink } from '@cardealer/types';
import { settingsService } from '../../../services/settings.service';

export interface NavigationSectionProps {
  initialData: NavigationSettings;
}

// 🧠 Mental Model: Navigation Builder cho phép quản trị viên thêm, sửa, xóa, sắp xếp menu đa cấp (Level 1 & Level 2).
// Dữ liệu được lưu độc lập vào key 'navigation_settings' trong bảng system_settings.
export const NavigationSection = ({ initialData }: NavigationSectionProps) => {
  const [links, setLinks] = useState<NavLink[]>(initialData.headerLinks || []);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Thêm menu cấp 1
  const handleAddHeaderLink = () => {
    const newLink: NavLink = {
      id: `nav-${Date.now()}`,
      label: 'Mục Menu Mới',
      url: '/',
      newTab: false,
      order: links.length + 1,
      subLinks: [],
    };
    setLinks([...links, newLink]);
  };

  // Cập nhật menu cấp 1
  const handleUpdateLink = (index: number, field: keyof NavLink, value: unknown) => {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: value };
    setLinks(updated);
  };

  // Xóa menu cấp 1
  const handleDeleteLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  // Thêm menu con cấp 2
  const handleAddSubLink = (parentIndex: number) => {
    const updated = [...links];
    const newSub: NavSubLink = {
      id: `sub-${Date.now()}`,
      label: 'Menu Con Mới',
      url: '/',
      newTab: false,
    };
    updated[parentIndex].subLinks = [...(updated[parentIndex].subLinks || []), newSub];
    setLinks(updated);
  };

  // Cập nhật menu con cấp 2
  const handleUpdateSubLink = (parentIndex: number, subIndex: number, field: keyof NavSubLink, value: unknown) => {
    const updated = [...links];
    const subLinks = [...(updated[parentIndex].subLinks || [])];
    subLinks[subIndex] = { ...subLinks[subIndex], [field]: value };
    updated[parentIndex].subLinks = subLinks;
    setLinks(updated);
  };

  // Xóa menu con cấp 2
  const handleDeleteSubLink = (parentIndex: number, subIndex: number) => {
    const updated = [...links];
    updated[parentIndex].subLinks = updated[parentIndex].subLinks?.filter((_, i) => i !== subIndex);
    setLinks(updated);
  };

  // Lưu cấu hình navigation_settings
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await settingsService.updateSettingByKey<NavigationSettings>('navigation_settings', {
        headerLinks: links,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể lưu cấu hình menu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white">Quản Trị Menu Điều Hướng (Navigation Builder)</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tùy biến cấu trúc thanh menu chính trên Desktop và Mobile Drawer.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleAddHeaderLink}
            className="flex items-center gap-2 text-xs sm:text-sm h-10 border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white"
          >
            <Plus className="w-4 h-4 text-sky-400" />
            <span>Thêm Menu Cấp 1</span>
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#0072CE] hover:bg-[#005BA4] text-white text-xs sm:text-sm h-10 px-5 shadow-lg shadow-[#0072CE]/25"
          >
            {saved ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Đã Lưu</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{saving ? 'Đang Lưu...' : 'Lưu Menu'}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-950/40 text-red-400 text-xs sm:text-sm rounded-xl border border-red-800/60">
          {error}
        </div>
      )}

      {/* Danh sách Links */}
      <div className="space-y-4">
        {links.map((link, parentIdx) => (
          <Card key={link.id || parentIdx} className="p-4 sm:p-5 border-slate-800 bg-slate-900/90 rounded-2xl space-y-4 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <span className="w-7 h-7 rounded-full bg-slate-800 text-sky-400 border border-slate-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {parentIdx + 1}
                </span>
                <input
                  type="text"
                  value={link.label}
                  onChange={(e) => handleUpdateLink(parentIdx, 'label', e.target.value)}
                  placeholder="Nhãn menu (VD: Dòng Xe)"
                  className="flex-1 px-3 py-2 text-sm font-semibold rounded-xl border border-slate-700/80 bg-slate-950/90 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-transparent transition-colors"
                />
              </div>

              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => handleUpdateLink(parentIdx, 'url', e.target.value)}
                  placeholder="Đường dẫn (VD: /xe)"
                  className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-700/80 bg-slate-950/90 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#0072CE] focus:border-transparent transition-colors"
                />

                <label className="flex items-center gap-1.5 text-xs text-slate-300 whitespace-nowrap cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={link.newTab}
                    onChange={(e) => handleUpdateLink(parentIdx, 'newTab', e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-[#0072CE] focus:ring-[#0072CE]"
                  />
                  <span>Tab mới</span>
                </label>

                <button
                  type="button"
                  onClick={() => handleDeleteLink(parentIdx)}
                  className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                  aria-label="Xóa menu"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Menu con cấp 2 (SubLinks) */}
            <div className="pl-6 border-l-2 border-slate-800 space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Menu Con Cấp 2 ({link.subLinks?.length || 0})
                </span>
                <button
                  type="button"
                  onClick={() => handleAddSubLink(parentIdx)}
                  className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm mục con</span>
                </button>
              </div>

              {link.subLinks && link.subLinks.length > 0 && (
                <div className="space-y-2">
                  {link.subLinks.map((sub, subIdx) => (
                    <div key={sub.id || subIdx} className="flex items-center gap-2 bg-slate-950/70 p-2 rounded-xl border border-slate-800/80">
                      <input
                        type="text"
                        value={sub.label}
                        onChange={(e) => handleUpdateSubLink(parentIdx, subIdx, 'label', e.target.value)}
                        placeholder="Tên menu con"
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-700/70 bg-slate-900 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#0072CE]"
                      />
                      <input
                        type="text"
                        value={sub.url}
                        onChange={(e) => handleUpdateSubLink(parentIdx, subIdx, 'url', e.target.value)}
                        placeholder="Đường dẫn"
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-700/70 bg-slate-900 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#0072CE]"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteSubLink(parentIdx, subIdx)}
                        className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                        aria-label="Xóa menu con"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

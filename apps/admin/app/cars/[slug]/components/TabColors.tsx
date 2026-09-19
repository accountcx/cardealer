import React, { useState, useEffect } from 'react';
import { Palette, Check, Star, Car as CarIcon, AlertCircle } from 'lucide-react';
import { Button, Card, Input, Badge } from '@cardealer/ui';
import { colorService } from '../../../../services/color.service';
import { VersionItem } from './TabVersions';

// 🧠 Mental Model: Tab 4 - Cấu hình bảng màu phiên bản xe (SCHEMA.md - version_colors).
// Mỗi phiên bản (CarVersion) sở hữu tập hợp màu riêng, màu mặc định (isDefault) và ảnh chụp xe thật (anhXeTheoMauUrl).

export interface VersionColorConfig {
  versionId: string;
  colorId: string;
  tenMau: string;
  hexCode: string;
  isTwoTone: boolean;
  secondaryHexCode?: string | null;
  selected: boolean;
  isDefault: boolean;
  anhXeTheoMauUrl?: string;
}

interface TabColorsProps {
  versions: VersionItem[];
  colorConfigs: VersionColorConfig[];
  setColorConfigs: React.Dispatch<React.SetStateAction<VersionColorConfig[]>>;
}

export function TabColors({ versions, colorConfigs, setColorConfigs }: TabColorsProps) {
  const [activeVersionId, setActiveVersionId] = useState<string>(versions[0]?.id || '');
  const [colorError, setColorError] = useState<string | null>(null);
  const [masterColors, setMasterColors] = useState<Array<{
    id: string;
    tenMau: string;
    hexCode: string;
    isTwoTone: boolean;
    secondaryHexCode?: string | null;
  }>>([]);

  useEffect(() => {
    if (versions.length > 0 && !versions.some((v) => v.id === activeVersionId)) {
      setActiveVersionId(versions[0]?.id || '');
    }
  }, [versions, activeVersionId]);

  useEffect(() => {
    async function fetchColors() {
      try {
        setColorError(null);
        const data = await colorService.getColors();
        if (Array.isArray(data)) {
          setMasterColors(data);
        } else {
          setMasterColors([]);
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Không thể kết nối cơ sở dữ liệu màu sơn';
        setColorError(msg);
        setMasterColors([]);
      }
    }

    fetchColors();
  }, []);

  const currentVersion = versions.find((v) => v.id === activeVersionId) || versions[0];

  const toggleColorForVersion = (versionId: string, color: typeof masterColors[0]) => {
    setColorConfigs((prev) => {
      const existing = prev.find((c) => c.versionId === versionId && c.colorId === color.id);
      if (existing) {
        return prev.map((c) =>
          c.versionId === versionId && c.colorId === color.id
            ? { ...c, selected: !c.selected, isDefault: !c.selected ? false : c.isDefault }
            : c
        );
      }
      return [
        ...prev,
        {
          versionId,
          colorId: color.id,
          tenMau: color.tenMau,
          hexCode: color.hexCode,
          isTwoTone: color.isTwoTone,
          secondaryHexCode: color.secondaryHexCode,
          selected: true,
          isDefault: false,
          anhXeTheoMauUrl: '',
        },
      ];
    });
  };

  const setDefaultColor = (versionId: string, colorId: string) => {
    setColorConfigs((prev) =>
      prev.map((c) =>
        c.versionId === versionId
          ? { ...c, isDefault: c.colorId === colorId }
          : c
      )
    );
  };

  const updateColorImage = (versionId: string, colorId: string, url: string) => {
    setColorConfigs((prev) =>
      prev.map((c) =>
        c.versionId === versionId && c.colorId === colorId
          ? { ...c, anhXeTheoMauUrl: url }
          : c
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <Palette size={18} className="text-[#0072CE]" />
            <h3 className="text-base font-bold text-white">
              Phối Màu Ngoại Thất Theo Từng Phiên Bản (version_colors)
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Chọn phiên bản xe để kích hoạt danh mục màu sơn, chỉ định màu mặc định (isDefault) và ảnh xe góc 3/4
          </p>
        </div>
      </div>

      {/* Version Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold text-slate-400 mr-2 shrink-0">Phiên bản:</span>
        {versions.map((ver) => {
          const isActive = ver.id === activeVersionId;
          const assignedCount = colorConfigs.filter((c) => c.versionId === ver.id && c.selected).length;
          return (
            <button
              key={ver.id}
              type="button"
              onClick={() => setActiveVersionId(ver.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#002C6C] text-white shadow-md border border-sky-400/30'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border border-white/5'
              }`}
            >
              <CarIcon size={14} className={isActive ? 'text-sky-300' : 'text-slate-400'} />
              <span>{ver.tenPhienBan}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isActive ? 'bg-[#0072CE]' : 'bg-slate-700'}`}>
                {assignedCount} màu
              </span>
            </button>
          );
        })}
      </div>

      {/* Error Banner */}
      {colorError && (
        <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 flex items-center gap-2 text-xs">
          <AlertCircle size={16} className="text-red-400 shrink-0" />
          <span><strong>Lỗi kết nối bảng màu:</strong> {colorError}</span>
        </div>
      )}

      {/* Colors Grid for the active version */}
      {masterColors.length === 0 && !colorError ? (
        <div className="p-8 text-center text-slate-400 text-xs bg-slate-900/40 rounded-xl border border-white/5">
          Chưa có mã màu sơn nào trong hệ thống. Vui lòng thêm màu tại trang Bảng Màu Ngoại Thất trước.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {masterColors.map((color) => {
            const config = colorConfigs.find((c) => c.versionId === activeVersionId && c.colorId === color.id);
            const isSelected = Boolean(config?.selected);
            const isDefault = Boolean(config?.isDefault);

            return (
            <Card
              key={color.id}
              variant="default"
              className={`p-4 transition-all duration-200 border overflow-hidden ${
                isSelected
                  ? isDefault
                    ? 'border-amber-500/70 bg-amber-950/15 shadow-md'
                    : 'border-sky-500/70 bg-sky-950/20'
                  : 'border-slate-800 bg-slate-900/60 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span
                    className="inline-block w-6 h-6 rounded-full border border-white/20 shadow-sm shrink-0"
                    style={{
                      background:
                        color.isTwoTone && color.secondaryHexCode
                          ? `linear-gradient(135deg, ${color.hexCode} 50%, ${color.secondaryHexCode} 50%)`
                          : color.hexCode,
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-semibold text-white truncate block" title={color.tenMau}>
                      {color.tenMau}
                    </span>
                    {color.isTwoTone && (
                      <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                        Two-Tone
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  variant={isSelected ? 'accent' : 'secondary'}
                  size="sm"
                  onClick={() => toggleColorForVersion(activeVersionId, color)}
                  leftIcon={isSelected ? <Check size={12} /> : undefined}
                  className="text-xs shrink-0 whitespace-nowrap"
                >
                  {isSelected ? 'Đã Chọn' : 'Chưa Chọn'}
                </Button>
              </div>

              {isSelected && (
                <div className="pt-3 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                      <input
                        type="radio"
                        name={`default_color_${activeVersionId}`}
                        checked={isDefault}
                        onChange={() => setDefaultColor(activeVersionId, color.id)}
                        className="w-3.5 h-3.5 text-[#0072CE] focus:ring-[#0072CE]"
                      />
                      <span>Màu mặc định ban đầu</span>
                    </label>
                    {isDefault && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                        <Star size={10} /> Mặc định
                      </span>
                    )}
                  </div>

                  <Input
                    label="Đường Dẫn Ảnh Xe Thật Theo Màu & Mâm Bản Này"
                    placeholder="/images/cars/tucson-white.webp"
                    value={config?.anhXeTheoMauUrl || ''}
                    onChange={(e) => updateColorImage(activeVersionId, color.id, e.target.value)}
                  />
                </div>
              )}
            </Card>
          );
        })}
        </div>
      )}
    </div>
  );
}

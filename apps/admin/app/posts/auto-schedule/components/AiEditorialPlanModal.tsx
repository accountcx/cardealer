"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Calendar,
  X,
  Check,
  Loader2,
  AlertCircle,
  FileText,
  Tag,
  Car,
  Compass,
  ArrowRight,
} from "lucide-react";
import { Button, Badge } from "@cardealer/ui";
import { autoPostService } from "../../../../services/auto-post.service";
import type { EditorialPlanItem } from "@cardealer/types";

interface CategoryOption {
  id: string;
  name: string;
}

interface CarOption {
  tenXe: string;
}

interface AiEditorialPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryOption[];
  cars: CarOption[];
  onPlanIngested: () => void;
}

export function AiEditorialPlanModal({
  isOpen,
  onClose,
  categories,
  cars,
  onPlanIngested,
}: AiEditorialPlanModalProps) {
  const [targetMonthCount, setTargetMonthCount] = useState<number>(12);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedCar, setSelectedCar] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Danh sách các bài được sinh ra từ AI
  const [generatedItems, setGeneratedItems] = useState<EditorialPlanItem[]>([]);
  // Danh sách index các bài được Admin chọn
  const [selectedIndexes, setSelectedIndexes] = useState<Set<number>>(new Set());

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMessage(null);
    setGeneratedItems([]);
    setSelectedIndexes(new Set());

    try {
      const res = await autoPostService.generateEditorialPlan({
        targetMonthCount,
        categoryId: selectedCategory || undefined,
        targetCar: selectedCar || undefined,
      });

      const items = res.planItems || [];
      setGeneratedItems(items);
      // Mặc định chọn tất cả
      setSelectedIndexes(new Set(items.map((_, i) => i)));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi khi AI lập kế hoạch 30 ngày";
      setErrorMessage(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedIndexes.size === generatedItems.length) {
      setSelectedIndexes(new Set());
    } else {
      setSelectedIndexes(new Set(generatedItems.map((_, i) => i)));
    }
  };

  const handleToggleItem = (index: number) => {
    const updated = new Set(selectedIndexes);
    if (updated.has(index)) {
      updated.delete(index);
    } else {
      updated.add(index);
    }
    setSelectedIndexes(updated);
  };

  const handleIngest = async () => {
    if (selectedIndexes.size === 0) return;

    setIsIngesting(true);
    setErrorMessage(null);

    try {
      const itemsToIngest = Array.from(selectedIndexes).map((idx) => {
        const item = generatedItems[idx];
        const scheduledDate = item.scheduledAt ? new Date(item.scheduledAt) : new Date();
        return {
          title: item.title,
          focusKeyword: item.focusKeyword,
          targetCar: item.targetCar || undefined,
          categoryId: item.categoryId || selectedCategory || undefined,
          angle: item.angle || undefined,
          summary: item.summary || undefined,
          scheduledAt: scheduledDate,
        };
      });

      await autoPostService.ingestPlan({ items: itemsToIngest });
      onPlanIngested();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi khi nạp kế hoạch vào hàng đợi";
      setErrorMessage(msg);
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Trợ Lý AI Lập Kế Hoạch Biên Tập 30 Ngày
                <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px]">
                  SEO Content Gap
                </Badge>
              </h2>
              <p className="text-xs text-slate-400">
                Tự động rà soát kho bài viết hiện có và dòng xe để thiết kế lịch đăng bài 1 tháng không trùng lặp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls & Filter */}
        <div className="p-6 border-b border-slate-800/80 bg-slate-950/40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Số lượng bài trong tháng
              </label>
              <select
                value={targetMonthCount}
                onChange={(e) => setTargetMonthCount(Number(e.target.value))}
                disabled={isGenerating || isIngesting}
                className="w-full h-10 px-3 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value={8}>8 bài (~2 bài/tuần)</option>
                <option value={12}>12 bài (~3 bài/tuần)</option>
                <option value={16}>16 bài (~4 bài/tuần)</option>
                <option value={20}>20 bài (Ngày thường)</option>
                <option value={30}>30 bài (Mỗi ngày 1 bài)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Dòng xe trọng tâm
              </label>
              <select
                value={selectedCar}
                onChange={(e) => setSelectedCar(e.target.value)}
                disabled={isGenerating || isIngesting}
                className="w-full h-10 px-3 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="">Tất cả các dòng xe trong Showroom</option>
                {cars.map((car) => (
                  <option key={car.tenXe} value={car.tenXe}>
                    {car.tenXe}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Chuyên mục ưu tiên
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                disabled={isGenerating || isIngesting}
                className="w-full h-10 px-3 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="">Đa dạng tất cả các chuyên mục</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || isIngesting}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-5 py-2 rounded-lg flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang phân tích kho nội dung & lập kế hoạch...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Bắt Đầu Phân Tích & Lập Kế Hoạch
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isGenerating && (
            <div className="py-16 text-center space-y-4">
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 animate-spin">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">AI đang phân tích các bài viết hiện có trên website...</p>
                <p className="text-xs text-slate-400">
                  Tìm kiếm khoảng trống nội dung và phân bổ lịch đăng đều đặn trong 30 ngày
                </p>
              </div>
            </div>
          )}

          {!isGenerating && generatedItems.length === 0 && (
            <div className="py-16 text-center space-y-3">
              <Calendar className="w-12 h-12 mx-auto text-slate-600" />
              <p className="text-sm font-medium text-slate-400">
                Chưa có kế hoạch nào được sinh. Vui lòng bấm <b>Bắt Đầu Phân Tích</b> ở trên.
              </p>
            </div>
          )}

          {!isGenerating && generatedItems.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleSelectAll}
                    className="text-xs text-sky-400 hover:text-sky-300 font-medium"
                  >
                    {selectedIndexes.size === generatedItems.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                  </button>
                  <span className="text-xs text-slate-500">
                    (Đã chọn {selectedIndexes.size} / {generatedItems.length} bài)
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  Phân bổ dàn đều 30 ngày
                </span>
              </div>

              <div className="space-y-2">
                {generatedItems.map((item, idx) => {
                  const isChecked = selectedIndexes.has(idx);
                  return (
                    <div
                      key={idx}
                      onClick={() => handleToggleItem(idx)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? "bg-slate-900/90 border-amber-500/40 shadow-sm"
                          : "bg-slate-950/30 border-slate-800/80 opacity-60 hover:opacity-80"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleItem(idx)}
                          className="mt-1 w-4 h-4 rounded text-amber-500 focus:ring-0 focus:ring-offset-0 bg-slate-800 border-slate-700 cursor-pointer"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className="bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[11px] font-mono">
                              Ngày {item.suggestedDay || idx + 1}
                            </Badge>
                            {item.targetCar && (
                              <Badge className="bg-slate-800 text-slate-300 border border-slate-700 text-[11px]">
                                {item.targetCar}
                              </Badge>
                            )}
                            <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px]">
                              {item.angle}
                            </Badge>
                          </div>
                          <h4 className="text-sm font-semibold text-white leading-snug">{item.title}</h4>
                          <p className="text-xs text-slate-400 line-clamp-2">{item.summary}</p>
                          <div className="pt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                            <Tag className="w-3 h-3 text-slate-500" />
                            <span>Từ khóa SEO:</span>
                            <span className="text-slate-300 font-mono font-medium">{item.focusKeyword}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-800 bg-slate-950/60">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            Hủy Bỏ
          </Button>

          {generatedItems.length > 0 && (
            <Button
              onClick={handleIngest}
              disabled={isIngesting || selectedIndexes.size === 0}
              className="bg-sky-600 hover:bg-sky-500 text-white font-semibold px-6 py-2 rounded-lg flex items-center gap-2"
            >
              {isIngesting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang nạp vào hàng đợi...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Nạp Vào Hàng Đợi ({selectedIndexes.size} Bài Viết)
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

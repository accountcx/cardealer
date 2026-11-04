"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  Save,
  CheckCircle2,
  AlertCircle,
  Power,
  Calendar,
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  Settings2,
} from "lucide-react";
import { Button, Card, Badge } from "@cardealer/ui";
import { autoPostService } from "../../../../services/auto-post.service";
import type { AutoPostSettings } from "@cardealer/types";

interface CategoryOption {
  id: string;
  name: string;
}

interface AutoPostSettingsCardProps {
  settings: AutoPostSettings | null;
  categories: CategoryOption[];
  onSettingsUpdated: (newSettings: AutoPostSettings) => void;
  disabled?: boolean;
}

type FrequencyMode = "daily" | "weekly" | "monthly" | "interval" | "custom";

const DAYS_OF_WEEK = [
  { value: 1, label: "T2", name: "Thứ Hai" },
  { value: 2, label: "T3", name: "Thứ Ba" },
  { value: 3, label: "T4", name: "Thứ Tư" },
  { value: 4, label: "T5", name: "Thứ Năm" },
  { value: 5, label: "T6", name: "Thứ Sáu" },
  { value: 6, label: "T7", name: "Thứ Bảy" },
  { value: 0, label: "CN", name: "Chủ Nhật" },
];

const TIME_PRESETS = ["07:00", "08:00", "09:00", "11:30", "14:00", "18:00", "20:00"];

export function AutoPostSettingsCard({
  settings,
  categories,
  onSettingsUpdated,
  disabled = false,
}: AutoPostSettingsCardProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [cronExpression, setCronExpression] = useState("0 8 * * *");
  const [defaultStatus, setDefaultStatus] = useState<"draft" | "published">("draft");
  const [defaultCategoryId, setDefaultCategoryId] = useState<string>("");

  // Visual schedule builder state
  const [mode, setMode] = useState<FrequencyMode>("daily");
  const [time, setTime] = useState<string>("08:00");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 4]); // Thứ 2 & Thứ 5
  const [dayOfMonth, setDayOfMonth] = useState<number>(1);
  const [intervalHours, setIntervalHours] = useState<number>(12);
  const [showAdvancedCron, setShowAdvancedCron] = useState<boolean>(false);
  const [syncPendingQueue, setSyncPendingQueue] = useState<boolean>(true);
  const [syncMode, setSyncMode] = useState<"reschedule_all" | "time_only">("reschedule_all");

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Phân tích biểu thức Cron sang các lựa chọn giao diện trực quan
  useEffect(() => {
    if (settings) {
      setIsEnabled(settings.isEnabled);
      setCronExpression(settings.cronExpression);
      setDefaultStatus(settings.defaultStatus);
      setDefaultCategoryId(settings.defaultCategoryId || "");

      const parts = (settings.cronExpression || "").trim().split(/\s+/);
      if (parts.length === 5) {
        const [min, hour, dom, mon, dow] = parts;

        // Interval: 0 */12 * * *
        if (min === "0" && hour.startsWith("*/") && dom === "*" && mon === "*" && dow === "*") {
          setMode("interval");
          setIntervalHours(parseInt(hour.replace("*/", ""), 10) || 12);
          return;
        }

        const hNum = parseInt(hour, 10);
        const mNum = parseInt(min, 10);
        const parsedTime = !isNaN(hNum) && !isNaN(mNum)
          ? `${String(hNum).padStart(2, "0")}:${String(mNum).padStart(2, "0")}`
          : "08:00";
        setTime(parsedTime);

        // Daily: 0 8 * * *
        if (!isNaN(hNum) && !isNaN(mNum) && dom === "*" && mon === "*" && dow === "*") {
          setMode("daily");
          return;
        }

        // Weekly: 0 8 * * 1,4
        if (!isNaN(hNum) && !isNaN(mNum) && dom === "*" && mon === "*" && dow !== "*") {
          setMode("weekly");
          const parsedDays = dow.split(",").map((d) => parseInt(d, 10)).filter((d) => !isNaN(d));
          if (parsedDays.length > 0) setSelectedDays(parsedDays);
          return;
        }

        // Monthly: 0 8 1 * *
        if (!isNaN(hNum) && !isNaN(mNum) && dom !== "*" && mon === "*" && dow === "*") {
          setMode("monthly");
          setDayOfMonth(parseInt(dom, 10) || 1);
          return;
        }
      }

      // Mặc định fallback nếu biểu thức lạ
      setMode("custom");
    }
  }, [settings]);

  // Tự động đồng bộ từ lựa chọn trực quan sang Cron Expression
  const syncToCronExpression = (
    newMode: FrequencyMode,
    newTime: string,
    newDays: number[],
    newDom: number,
    newInterval: number
  ) => {
    const [hStr, mStr] = newTime.split(":");
    const h = parseInt(hStr || "8", 10);
    const m = parseInt(mStr || "0", 10);

    let expr = "0 8 * * *";
    if (newMode === "daily") {
      expr = `${m} ${h} * * *`;
    } else if (newMode === "weekly") {
      const sortedDays = newDays.length > 0 ? [...newDays].sort((a, b) => a - b).join(",") : "1";
      expr = `${m} ${h} * * ${sortedDays}`;
    } else if (newMode === "monthly") {
      expr = `${m} ${h} ${newDom} * *`;
    } else if (newMode === "interval") {
      expr = `0 */${newInterval} * * *`;
    }
    setCronExpression(expr);
  };

  const handleModeChange = (newMode: FrequencyMode) => {
    setMode(newMode);
    if (newMode !== "custom") {
      syncToCronExpression(newMode, time, selectedDays, dayOfMonth, intervalHours);
    }
  };

  const handleTimeChange = (newTime: string) => {
    setTime(newTime);
    if (mode !== "custom") {
      syncToCronExpression(mode, newTime, selectedDays, dayOfMonth, intervalHours);
    }
  };

  const handleToggleDay = (dayVal: number) => {
    let nextDays: number[];
    if (selectedDays.includes(dayVal)) {
      if (selectedDays.length === 1) return; // Giữ ít nhất 1 ngày
      nextDays = selectedDays.filter((d) => d !== dayVal);
    } else {
      nextDays = [...selectedDays, dayVal];
    }
    setSelectedDays(nextDays);
    syncToCronExpression("weekly", time, nextDays, dayOfMonth, intervalHours);
  };

  const handleDayOfMonthChange = (newDom: number) => {
    setDayOfMonth(newDom);
    syncToCronExpression("monthly", time, selectedDays, newDom, intervalHours);
  };

  const handleIntervalChange = (newInt: number) => {
    setIntervalHours(newInt);
    syncToCronExpression("interval", time, selectedDays, dayOfMonth, newInt);
  };

  // Tạo câu tóm tắt lịch chạy bằng tiếng Việt tự nhiên
  const getHumanReadableSummary = () => {
    if (mode === "daily") {
      return `Chạy tự động mỗi ngày vào lúc ${time}`;
    }
    if (mode === "weekly") {
      const dayNames = DAYS_OF_WEEK.filter((d) => selectedDays.includes(d.value))
        .map((d) => d.name)
        .join(", ");
      return `Chạy tự động lúc ${time} vào các ngày: ${dayNames || "Chưa chọn ngày"}`;
    }
    if (mode === "monthly") {
      return `Chạy tự động lúc ${time} vào ngày ${dayOfMonth} hàng tháng`;
    }
    if (mode === "interval") {
      return `Chạy định kỳ mỗi ${intervalHours} tiếng một lần`;
    }
    return `Chạy theo cấu hình nâng cao: "${cronExpression}"`;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const updated = await autoPostService.updateSettings({
        isEnabled,
        cronExpression,
        defaultStatus,
        defaultCategoryId: defaultCategoryId || undefined,
        syncPendingQueue,
        syncMode,
        targetTime: time,
      });
      onSettingsUpdated(updated);
      setSaveMessage({
        type: "success",
        text: syncPendingQueue
          ? "Đã lưu cấu hình và tự động đồng bộ giờ đăng cho các bài viết trong hàng đợi!"
          : "Đã lưu và cập nhật lịch chạy thành công!",
      });
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi khi lưu cấu hình";
      setSaveMessage({ type: "error", text: msg });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="p-6 bg-slate-900/60 border-slate-800 rounded-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Cấu Hình Lập Lịch Viết Bài</h2>
            <p className="text-xs text-slate-400">
              Chọn thời gian và chu kỳ xuất bản bài viết hoàn toàn trực quan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isEnabled ? (
            <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Đang Chạy Tự Động
            </Badge>
          ) : (
            <Badge className="bg-slate-800 text-slate-400 border border-slate-700 px-3 py-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              Tạm Dừng
            </Badge>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Switch Kích Hoạt */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
          <div className="space-y-0.5">
            <label className="text-sm font-medium text-white flex items-center gap-2">
              <Power className={`w-4 h-4 ${isEnabled ? "text-emerald-400" : "text-slate-500"}`} />
              Kích hoạt tự động viết bài theo lịch hẹn
            </label>
            <p className="text-xs text-slate-400">
              Khi bật, hệ thống sẽ tự động gọi AI viết bài theo đúng khung giờ bạn đã chọn
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              disabled={disabled}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
          </label>
        </div>

        {/* 2. Bộ Chọn Chu Kỳ & Thời Gian Trực Quan (Visual Schedule Picker) */}
        <div className="space-y-4 p-5 rounded-xl bg-slate-950/40 border border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              1. Chọn chu kỳ đăng bài
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => handleModeChange("daily")}
                disabled={disabled}
                className={`py-2.5 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                  mode === "daily"
                    ? "bg-sky-600 border-sky-500 text-white shadow-md shadow-sky-600/20"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                <span>Mỗi Ngày</span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange("weekly")}
                disabled={disabled}
                className={`py-2.5 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                  mode === "weekly"
                    ? "bg-sky-600 border-sky-500 text-white shadow-md shadow-sky-600/20"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                <span>Các Ngày Trong Tuần</span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange("monthly")}
                disabled={disabled}
                className={`py-2.5 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                  mode === "monthly"
                    ? "bg-sky-600 border-sky-500 text-white shadow-md shadow-sky-600/20"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                <span>Hàng Tháng</span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange("interval")}
                disabled={disabled}
                className={`py-2.5 px-3 rounded-lg text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                  mode === "interval"
                    ? "bg-sky-600 border-sky-500 text-white shadow-md shadow-sky-600/20"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
              >
                <span>Cách Mấy Tiếng</span>
              </button>
            </div>
          </div>

          {/* Nếu chọn Weekly: Chọn các ngày trong tuần */}
          {mode === "weekly" && (
            <div className="pt-2 animate-in fade-in duration-200">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Chọn các ngày xuất bản trong tuần:
              </label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((d) => {
                  const isSelected = selectedDays.includes(d.value);
                  return (
                    <button
                      type="button"
                      key={d.value}
                      onClick={() => handleToggleDay(d.value)}
                      disabled={disabled}
                      className={`h-9 px-3.5 rounded-lg text-xs font-medium border transition-all ${
                        isSelected
                          ? "bg-amber-500 border-amber-400 text-slate-950 font-bold shadow-sm shadow-amber-500/20"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                      }`}
                    >
                      {d.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Nếu chọn Monthly: Chọn ngày trong tháng */}
          {mode === "monthly" && (
            <div className="pt-2 animate-in fade-in duration-200">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Chọn ngày trong tháng:
              </label>
              <select
                value={dayOfMonth}
                onChange={(e) => handleDayOfMonthChange(Number(e.target.value))}
                disabled={disabled}
                className="w-48 h-10 px-3 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
              >
                {[...Array(31)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Ngày {i + 1} hàng tháng
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Nếu chọn Interval: Chọn số tiếng */}
          {mode === "interval" && (
            <div className="pt-2 animate-in fade-in duration-200">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Khoảng thời gian giãn cách:
              </label>
              <select
                value={intervalHours}
                onChange={(e) => handleIntervalChange(Number(e.target.value))}
                disabled={disabled}
                className="w-48 h-10 px-3 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-500"
              >
                <option value={4}>Mỗi 4 tiếng một lần</option>
                <option value={6}>Mỗi 6 tiếng một lần</option>
                <option value={8}>Mỗi 8 tiếng một lần</option>
                <option value={12}>Mỗi 12 tiếng một lần</option>
                <option value={24}>Mỗi 24 tiếng một lần</option>
              </select>
            </div>
          )}

          {/* Khung giờ chạy (Áp dụng cho daily, weekly, monthly) */}
          {mode !== "interval" && mode !== "custom" && (
            <div className="pt-3 border-t border-slate-800/80">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                2. Chọn khung giờ chạy trong ngày
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  disabled={disabled}
                  className="h-10 px-3 text-sm font-semibold bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-sky-500 cursor-pointer"
                />

                {/* Quick time chips */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {TIME_PRESETS.map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => handleTimeChange(t)}
                      disabled={disabled}
                      className={`px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                        time === t
                          ? "bg-sky-500/20 border-sky-500/50 text-sky-300"
                          : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Preview Hộp Diễn Giải Lịch Tự Nhiên (Human-Readable Summary) */}
          <div className="p-3.5 rounded-lg bg-sky-950/30 border border-sky-500/30 text-sky-200 flex items-center gap-3 text-xs">
            <CalendarCheck className="w-5 h-5 text-sky-400 shrink-0" />
            <div>
              <span className="font-semibold text-white">Lịch chạy dự kiến: </span>
              <span className="text-sky-300 font-medium">{getHumanReadableSummary()}</span>
            </div>
          </div>

          {/* Tùy chọn Tự động đồng bộ giờ đăng cho các bài viết trong hàng đợi */}
          <div className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2.5">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={syncPendingQueue}
                onChange={(e) => setSyncPendingQueue(e.target.checked)}
                disabled={disabled}
                className="mt-0.5 rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-sky-500 cursor-pointer"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-sky-400" />
                  Tự động đồng bộ giờ đăng cho các bài viết đang chờ trong hàng đợi
                </span>
                <p className="text-[11px] text-slate-400">
                  Khi lưu cấu hình, các bài viết đã lên lịch sẵn sẽ tự động cập nhật lại thời gian theo khung giờ hoặc chu kỳ mới này.
                </p>
              </div>
            </label>

            {syncPendingQueue && (
              <div className="pl-6 pt-2 flex flex-wrap items-center gap-4 text-xs border-t border-slate-800/60">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="radio"
                    name="syncMode"
                    value="reschedule_all"
                    checked={syncMode === "reschedule_all"}
                    onChange={() => setSyncMode("reschedule_all")}
                    disabled={disabled}
                    className="text-sky-500 bg-slate-950 border-slate-700 focus:ring-sky-500 cursor-pointer"
                  />
                  <span className="font-medium text-sky-400">Tự động sắp xếp lại ngày & giờ theo chu kỳ mới (Khuyên dùng)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-white">
                  <input
                    type="radio"
                    name="syncMode"
                    value="time_only"
                    checked={syncMode === "time_only"}
                    onChange={() => setSyncMode("time_only")}
                    disabled={disabled}
                    className="text-sky-500 bg-slate-950 border-slate-700 focus:ring-sky-500 cursor-pointer"
                  />
                  <span>Chỉ đổi khung giờ (giữ nguyên ngày đã hẹn)</span>
                </label>
              </div>
            )}
          </div>

          {/* Tùy chỉnh nâng cao (Dành cho Developer nếu muốn xem biểu thức Cron gốc) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvancedCron(!showAdvancedCron)}
              className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Cài đặt biểu thức Cron nâng cao</span>
              {showAdvancedCron ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {showAdvancedCron && (
              <div className="mt-2.5 p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Biểu thức Cron tương ứng:</span>
                  <span className="font-mono text-amber-400 font-medium">{cronExpression}</span>
                </div>
                <input
                  type="text"
                  value={cronExpression}
                  onChange={(e) => {
                    setCronExpression(e.target.value);
                    setMode("custom");
                  }}
                  disabled={disabled}
                  placeholder="0 8 * * *"
                  className="w-full h-9 px-3 text-xs font-mono bg-slate-950 border border-slate-700 rounded text-white focus:outline-none focus:border-sky-500"
                />
                <p className="text-[10px] text-slate-500">
                  Lưu ý: Chỉ chỉnh sửa trực tiếp chuỗi cron nếu bạn am hiểu cú pháp UNIX crontab.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 3. Trạng thái xuất bản mặc định & Chuyên mục mặc định */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Trạng thái bài viết sau khi tạo
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                  defaultStatus === "draft"
                    ? "bg-sky-500/10 border-sky-500/40 text-white"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="defaultStatus"
                  value="draft"
                  checked={defaultStatus === "draft"}
                  onChange={() => setDefaultStatus("draft")}
                  disabled={disabled}
                  className="sr-only"
                />
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-xs font-medium">Lưu nháp (Draft)</span>
              </label>

              <label
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                  defaultStatus === "published"
                    ? "bg-sky-500/10 border-sky-500/40 text-white"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="defaultStatus"
                  value="published"
                  checked={defaultStatus === "published"}
                  onChange={() => setDefaultStatus("published")}
                  disabled={disabled}
                  className="sr-only"
                />
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-medium">Xuất bản ngay (Public)</span>
              </label>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Khuyên dùng: Chọn <b>Lưu nháp</b> để ban biên tập có thể xem lại trước khi đăng công khai.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Chuyên mục bài viết mặc định
            </label>
            <select
              value={defaultCategoryId}
              onChange={(e) => setDefaultCategoryId(e.target.value)}
              disabled={disabled}
              className="w-full h-10 px-3 text-sm bg-slate-950/60 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-sky-500 transition-colors"
            >
              <option value="" className="bg-slate-900 text-white">
                -- Tự động theo kế hoạch bài viết --
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Thông báo kết quả lưu */}
        {saveMessage && (
          <div
            className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              saveMessage.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
            }`}
          >
            {saveMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{saveMessage.text}</span>
          </div>
        )}

        {/* Action button */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            disabled={disabled || isSaving}
            className="bg-sky-600 hover:bg-sky-500 text-white px-5 py-2 text-sm font-medium flex items-center gap-2 rounded-lg"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Đang lưu cấu hình..." : "Lưu Cấu Hình Lịch Chạy"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

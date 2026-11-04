"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Zap,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ListTree,
} from "lucide-react";
import { Button, Badge } from "@cardealer/ui";
import { useAuth } from "../../../contexts/AuthContext";
import { AccessDenied } from "../../components/AccessDenied";
import { autoPostService, type RunNowResponse } from "../../../services/auto-post.service";
import { postService, type CategoryItem } from "../../../services/post.service";
import { catalogService, type CarSummary } from "../../../services/catalog.service";
import type { AutoPostSettings, ContentPlanItem, AutoPostLog } from "@cardealer/types";

import { AutoPostSettingsCard } from "./components/AutoPostSettingsCard";
import { ContentPlanQueueTable } from "./components/ContentPlanQueueTable";
import { AutoPostLogsTable } from "./components/AutoPostLogsTable";
import { AiEditorialPlanModal } from "./components/AiEditorialPlanModal";

export default function AutoPostSchedulePage() {
  const { user } = useAuth();
  const canRead = user && (user.role === "admin" || user.role === "manager" || user.role === "editor");
  const canWrite = user && (user.role === "admin" || user.role === "manager");

  // State
  const [settings, setSettings] = useState<AutoPostSettings | null>(null);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [cars, setCars] = useState<{ tenXe: string }[]>([]);

  // Hàng đợi bài viết
  const [plans, setPlans] = useState<ContentPlanItem[]>([]);
  const [isPlansLoading, setIsPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [plansFilter, setPlansFilter] = useState<string>("all");
  const [plansPage, setPlansPage] = useState<number>(1);
  const [plansPagination, setPlansPagination] = useState({ page: 1, limit: 15, totalItems: 0, totalPages: 1 });

  // Nhật ký thực thi
  const [logs, setLogs] = useState<AutoPostLog[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [logsPage, setLogsPage] = useState<number>(1);
  const [logsPagination, setLogsPagination] = useState({ page: 1, limit: 10, totalItems: 0, totalPages: 1 });

  // Modal AI
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Run Now state
  const [isRunningNow, setIsRunningNow] = useState(false);
  const [runNowResult, setRunNowResult] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Fetch Settings & Dependencies
  const fetchSettingsAndMetadata = useCallback(async () => {
    try {
      const [settingsData, categoriesData, carsData] = await Promise.all([
        autoPostService.getSettings(),
        postService.getCategories().catch(() => []),
        catalogService.getCars().catch(() => ({ cars: [] })),
      ]);

      setSettings(settingsData);
      const catList = Array.isArray(categoriesData)
        ? categoriesData
        : Array.isArray(categoriesData?.data)
        ? categoriesData.data
        : [];
      setCategories(
        catList.map((c: CategoryItem) => ({
          id: c.id,
          name: c.tenChuyenMuc,
        }))
      );
      setCars(
        ((carsData as { cars?: CarSummary[] })?.cars || []).map((car) => ({
          tenXe: car.tenXe,
        }))
      );
    } catch (err: unknown) {
      console.error("[AutoPost Page] Lỗi nạp metadata:", err);
    }
  }, []);

  // Fetch Plans
  const fetchPlans = useCallback(async () => {
    setIsPlansLoading(true);
    setPlansError(null);
    try {
      const res = await autoPostService.getPlans({
        page: plansPage,
        limit: 15,
        status: plansFilter,
      });
      const itemsList = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setPlans(itemsList);
      setPlansPagination(res?.pagination || { page: 1, limit: 15, totalItems: itemsList.length, totalPages: 1 });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi khi tải hàng đợi kế hoạch";
      setPlansError(msg);
    } finally {
      setIsPlansLoading(false);
    }
  }, [plansPage, plansFilter]);

  // Fetch Logs
  const fetchLogs = useCallback(async () => {
    setIsLogsLoading(true);
    setLogsError(null);
    try {
      const res = await autoPostService.getLogs({
        page: logsPage,
        limit: 10,
      });
      const logsList = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      setLogs(logsList);
      setLogsPagination(res?.pagination || { page: 1, limit: 10, totalItems: logsList.length, totalPages: 1 });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi khi tải nhật ký thực thi";
      setLogsError(msg);
    } finally {
      setIsLogsLoading(false);
    }
  }, [logsPage]);

  useEffect(() => {
    if (canRead) {
      void fetchSettingsAndMetadata();
    }
  }, [canRead, fetchSettingsAndMetadata]);

  useEffect(() => {
    if (canRead) {
      void fetchPlans();
    }
  }, [canRead, fetchPlans]);

  useEffect(() => {
    if (canRead) {
      void fetchLogs();
    }
  }, [canRead, fetchLogs]);

  // Handle Delete Plan Item
  const handleDeletePlanItem = async (id: string) => {
    await autoPostService.deletePlan(id);
    await fetchPlans();
  };

  // Handle Run Now
  const handleRunNow = async () => {
    setIsRunningNow(true);
    setRunNowResult(null);

    try {
      const res = await autoPostService.runNow();
      setRunNowResult({
        type: "success",
        message: `Đã viết xong bài: "${res.title}" (${(res.executionTimeMs / 1000).toFixed(1)}s, trạng thái: ${res.status}). Đã lưu vào danh sách bài viết!`,
      });
      // Refresh queues and logs
      void fetchPlans();
      void fetchLogs();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi trong quá trình tự động viết bài";
      setRunNowResult({
        type: "error",
        message: msg,
      });
      void fetchLogs();
    } finally {
      setIsRunningNow(false);
    }
  };

  // Đồng bộ thủ công giờ đăng cho hàng đợi
  const handleSyncQueue = async () => {
    try {
      await autoPostService.syncQueue({ syncMode: "reschedule_all" });
      await fetchPlans();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Lỗi khi đồng bộ giờ đăng hàng đợi";
      setPlansError(msg);
    }
  };

  if (!canRead) {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link href="/posts" className="hover:text-white flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại Bài viết</span>
            </Link>
            <span>/</span>
            <span className="text-slate-300">Tự động viết bài theo định kỳ</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              Lập Lịch Tự Động Viết Bài & Kế Hoạch 30 Ngày
            </h1>
            <Badge className="bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs">
              v1.4.0 Engine
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            Hệ thống tự động hóa Inbound Marketing: Lập lịch cron, AI tạo bài viết hoàn chỉnh và kế hoạch biên tập 1 tháng
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsAiModalOpen(true)}
            disabled={!canWrite || isRunningNow}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-4 py-2 text-sm rounded-lg flex items-center gap-2 shadow-lg shadow-amber-500/10"
          >
            <Sparkles className="w-4 h-4" />
            AI Lập Kế Hoạch 30 Ngày
          </Button>

          <Button
            onClick={handleRunNow}
            disabled={!canWrite || isRunningNow}
            className="bg-sky-600 hover:bg-sky-500 text-white font-semibold px-4 py-2 text-sm rounded-lg flex items-center gap-2 shadow-lg shadow-sky-600/10"
          >
            {isRunningNow ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang Viết Bài Tự Động...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                ⚡ Viết Bài Ngay
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Alert Result after Run Now */}
      {runNowResult && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
            runNowResult.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {runNowResult.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
            )}
            <span>{runNowResult.message}</span>
          </div>
          <button
            onClick={() => setRunNowResult(null)}
            className="text-xs underline hover:text-white ml-4 shrink-0"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Grid: Card 1 Settings */}
      <AutoPostSettingsCard
        settings={settings}
        categories={categories}
        onSettingsUpdated={(newSettings) => {
          setSettings(newSettings);
          void fetchPlans();
        }}
        disabled={!canWrite}
      />

      {/* Grid: Card 2 Content Plan Queue */}
      <ContentPlanQueueTable
        items={plans}
        isLoading={isPlansLoading}
        error={plansError}
        onRetry={fetchPlans}
        onDeleteItem={handleDeletePlanItem}
        onOpenAiPlanner={() => setIsAiModalOpen(true)}
        onSyncQueue={canWrite ? handleSyncQueue : undefined}
        statusFilter={plansFilter}
        onStatusFilterChange={(status) => {
          setPlansFilter(status);
          setPlansPage(1);
        }}
        pagination={plansPagination}
        onPageChange={(page) => setPlansPage(page)}
      />

      {/* Grid: Card 3 Execution Logs */}
      <AutoPostLogsTable
        logs={logs}
        isLoading={isLogsLoading}
        error={logsError}
        onRetry={fetchLogs}
        pagination={logsPagination}
        onPageChange={(page) => setLogsPage(page)}
      />

      {/* Modal: AI 30-Day Editorial Plan */}
      <AiEditorialPlanModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        categories={categories}
        cars={cars}
        onPlanIngested={() => {
          void fetchPlans();
        }}
      />
    </div>
  );
}

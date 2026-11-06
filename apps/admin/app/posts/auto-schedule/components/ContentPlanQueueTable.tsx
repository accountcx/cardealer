"use client";

import React, { useState } from "react";
import {
  ListTree,
  Calendar,
  Trash2,
  AlertCircle,
  Tag,
  CheckCircle2,
  Clock,
  Loader2,
  Plus,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button, Card, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@cardealer/ui";
import type { ContentPlanItem, ContentPlanStatus } from "@cardealer/types";

interface ContentPlanQueueTableProps {
  items: ContentPlanItem[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onDeleteItem: (id: string) => Promise<void>;
  onOpenAiPlanner: () => void;
  onSyncQueue?: () => Promise<void>;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
}

export function ContentPlanQueueTable({
  items,
  isLoading,
  error,
  onRetry,
  onDeleteItem,
  onOpenAiPlanner,
  onSyncQueue,
  statusFilter,
  onStatusFilterChange,
  pagination,
  onPageChange,
}: ContentPlanQueueTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const handleSyncQueueClick = async () => {
    if (!onSyncQueue) return;
    setIsSyncing(true);
    try {
      await onSyncQueue();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này khỏi hàng đợi kế hoạch?")) {
      return;
    }
    setDeletingId(id);
    try {
      await onDeleteItem(id);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: ContentPlanStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs">
            Chờ thực thi
          </Badge>
        );
      case "processing":
        return (
          <Badge className="bg-sky-500/10 text-sky-400 border border-sky-500/20 text-xs flex items-center gap-1">
            <Loader2 className="w-3 h-3 animate-spin" />
            Đang viết bài...
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs">
            Đã hoàn thành
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs">
            Thất bại
          </Badge>
        );
      default:
        return <Badge className="bg-slate-800 text-slate-400 border border-slate-700 text-xs">{status}</Badge>;
    }
  };

  const getClusterBadge = (cluster?: string | null, angle?: string | null) => {
    let effective = cluster;
    if (!effective && angle) {
      if (angle.includes("So sánh") || angle.includes("so sánh")) effective = "comparison";
      else if (angle.includes("Thủ tục") || angle.includes("Tài chính") || angle.includes("trả góp"))
        effective = "finance_procedure";
      else if (angle.includes("Đánh giá") || angle.includes("chi tiết")) effective = "detailed_review";
    }

    switch (effective) {
      case "comparison":
        return (
          <Badge className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px]">
            So sánh xe
          </Badge>
        );
      case "finance_procedure":
        return (
          <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
            Thủ tục & Tài chính
          </Badge>
        );
      case "detailed_review":
        return (
          <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px]">
            Đánh giá chi tiết
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateInput: string | Date) => {
    try {
      const d = new Date(dateInput);
      return d.toLocaleString("vi-VN", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(dateInput);
    }
  };

  const filterTabs = [
    { label: "Tất cả", value: "all" },
    { label: "Chờ thực thi", value: "pending" },
    { label: "Đang viết", value: "processing" },
    { label: "Đã hoàn thành", value: "completed" },
    { label: "Lỗi", value: "failed" },
  ];

  return (
    <Card className="p-6 bg-slate-900/60 border-slate-800 rounded-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <ListTree className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Hàng Đợi Kế Hoạch Bài Viết</h3>
            <p className="text-xs text-slate-400">
              Danh sách các bài viết dự kiến sẽ được tự động tạo và xuất bản
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onSyncQueue && items.length > 0 && (
            <Button
              onClick={handleSyncQueueClick}
              disabled={isSyncing}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 text-xs rounded-lg flex items-center gap-1.5 transition-colors"
              title="Đồng bộ lại khung giờ cho toàn bộ các bài viết đang chờ"
            >
              {isSyncing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Clock className="w-3.5 h-3.5 text-sky-400" />
              )}
              <span>Đồng bộ giờ đăng</span>
            </Button>
          )}

          <Button
            onClick={onOpenAiPlanner}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-4 py-2 text-xs rounded-lg flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            Lập Kế Hoạch 30 Ngày Bằng AI
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onStatusFilterChange(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === tab.value
                ? "bg-sky-600 text-white"
                : "bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 4-State UI Matrix */}
      {/* State 1: Error */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            variant="ghost"
            onClick={onRetry}
            className="text-xs text-rose-300 hover:text-white underline"
          >
            Thử lại
          </Button>
        </div>
      )}

      {/* State 2: Loading */}
      {isLoading && (
        <div className="space-y-3 py-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 rounded-lg bg-slate-800/40 animate-pulse" />
          ))}
        </div>
      )}

      {/* State 3: Empty */}
      {!isLoading && !error && items.length === 0 && (
        <div className="py-16 text-center space-y-4">
          <Calendar className="w-12 h-12 mx-auto text-slate-600" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-white">Hàng đợi kế hoạch đang trống</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Chưa có bài viết nào trong hàng đợi. Bạn có thể sử dụng Trợ lý AI để quét content gap và sinh 30 ngày bài viết chỉ với 1-Click.
            </p>
          </div>
          <Button
            onClick={onOpenAiPlanner}
            className="bg-sky-600 hover:bg-sky-500 text-white text-xs px-4 py-2 rounded-lg inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            Bắt đầu lập kế hoạch ngay
          </Button>
        </div>
      )}

      {/* State 4: Data Table */}
      {!isLoading && !error && items.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <Table>
            <TableHeader className="bg-slate-950/80 border-b border-slate-800">
              <TableRow className="border-b border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400 text-xs font-semibold">Tiêu Đề & Từ Khóa</TableHead>
                <TableHead className="text-slate-400 text-xs font-semibold">Dòng Xe & Định Hướng</TableHead>
                <TableHead className="text-slate-400 text-xs font-semibold">Chuyên Mục</TableHead>
                <TableHead className="text-slate-400 text-xs font-semibold">Lịch Dự Kiến</TableHead>
                <TableHead className="text-slate-400 text-xs font-semibold">Trạng Thái</TableHead>
                <TableHead className="text-slate-400 text-xs font-semibold text-right">Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                  <TableCell className="py-3">
                    <div className="space-y-1 max-w-md">
                      <p className="text-sm font-semibold text-white line-clamp-1">{item.title}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Tag className="w-3 h-3 text-sky-400" />
                        <span className="font-mono text-sky-300">{item.focusKeyword}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-3">
                    <div className="space-y-1 text-xs text-slate-300">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-medium text-white">{item.targetCar || "Tất cả dòng xe"}</p>
                        {getClusterBadge(item.cluster, item.angle)}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{item.angle || "Chung"}</p>
                    </div>
                  </TableCell>

                  <TableCell className="py-3">
                    <span className="text-xs text-slate-300">{item.categoryName || "Mặc định"}</span>
                  </TableCell>

                  <TableCell className="py-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatDate(item.scheduledAt)}</span>
                    </div>
                  </TableCell>

                  <TableCell className="py-3">
                    {getStatusBadge(item.status)}
                    {item.errorMessage && (
                      <p className="text-[10px] text-rose-400 line-clamp-1 mt-1" title={item.errorMessage}>
                        {item.errorMessage}
                      </p>
                    )}
                  </TableCell>

                  <TableCell className="py-3 text-right">
                    <Button
                      variant="ghost"
                      onClick={() => handleDelete(item.id)}
                      disabled={deletingId === item.id || item.status === "processing"}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Xóa mục này"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-slate-400">
            Hiển thị trang <b>{pagination.page}</b> / <b>{pagination.totalPages}</b> (Tổng số {pagination.totalItems} mục)
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
              className="p-1.5 border-slate-800 text-slate-300 hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
              className="p-1.5 border-slate-800 text-slate-300 hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

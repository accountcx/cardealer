"use client";

import React from "react";
import {
  History,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, Badge, Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button } from "@cardealer/ui";
import type { AutoPostLog } from "@cardealer/types";

interface AutoPostLogsTableProps {
  logs: AutoPostLog[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
}

export function AutoPostLogsTable({
  logs,
  isLoading,
  error,
  onRetry,
  pagination,
  onPageChange,
}: AutoPostLogsTableProps) {
  const formatDate = (dateInput: string | Date) => {
    try {
      const d = new Date(dateInput);
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return String(dateInput);
    }
  };

  return (
    <Card className="p-6 bg-slate-900/60 border-slate-800 rounded-xl space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
        <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
          <History className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Nhật Ký Thực Thi Tác Vụ</h3>
          <p className="text-xs text-slate-400">
            Lịch sử các lần tự động viết bài (qua Cron định kỳ hoặc kích hoạt Chạy ngay)
          </p>
        </div>
      </div>

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
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-slate-800/40 animate-pulse" />
          ))}
        </div>
      )}

      {/* State 3: Empty */}
      {!isLoading && !error && logs.length === 0 && (
        <div className="py-12 text-center space-y-2">
          <History className="w-10 h-10 mx-auto text-slate-600" />
          <p className="text-sm font-medium text-slate-400">Chưa có lượt thực thi nào được ghi nhận</p>
        </div>
      )}

      {/* State 4: Data Table */}
      {!isLoading && !error && logs.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-slate-800">
          <Table>
            <TableHeader className="bg-slate-950/80 border-b border-slate-800">
              <TableRow className="border-b border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-400 text-xs font-semibold">Thời Gian</TableHead>
                <TableHead className="text-slate-400 text-xs font-semibold">Kiểu Kích Hoạt</TableHead>
                <TableHead className="text-slate-400 text-xs font-semibold">Bài Viết Đã Tạo</TableHead>
                <TableHead className="text-slate-400 text-xs font-semibold">Trạng Thái</TableHead>
                <TableHead className="text-slate-400 text-xs font-semibold">Thời Gian Chạy</TableHead>
                <TableHead className="text-slate-400 text-xs font-semibold">Chi Tiết Lỗi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                  <TableCell className="py-3 text-xs text-slate-300 whitespace-nowrap">
                    {formatDate(log.createdAt)}
                  </TableCell>

                  <TableCell className="py-3">
                    {log.triggerType === "cron" ? (
                      <Badge className="bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[11px] flex items-center gap-1 w-fit">
                        <Clock className="w-3 h-3" />
                        Lập lịch Cron
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] flex items-center gap-1 w-fit">
                        <Zap className="w-3 h-3" />
                        Chạy ngay (Thủ công)
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="py-3">
                    <p className="text-sm font-medium text-white line-clamp-1">
                      {log.postTitle || "-- Không có --"}
                    </p>
                  </TableCell>

                  <TableCell className="py-3">
                    {log.status === "success" ? (
                      <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" />
                        Thành công
                      </Badge>
                    ) : (
                      <Badge className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs flex items-center gap-1 w-fit">
                        <AlertCircle className="w-3 h-3" />
                        Thất bại
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="py-3 text-xs text-slate-300 font-mono">
                    {log.executionTimeMs ? `${(log.executionTimeMs / 1000).toFixed(1)}s` : "--"}
                  </TableCell>

                  <TableCell className="py-3 text-xs text-rose-400 max-w-xs truncate" title={log.errorMessage || ""}>
                    {log.errorMessage || "--"}
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
            Trang <b>{pagination.page}</b> / <b>{pagination.totalPages}</b> ({pagination.totalItems} bản ghi)
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

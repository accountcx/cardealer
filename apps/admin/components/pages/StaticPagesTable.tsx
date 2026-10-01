'use client';

import React from 'react';
import Link from 'next/link';
import { Edit, Trash2, ExternalLink, FileText } from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  Skeleton,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@cardealer/ui';
import type { StaticPage } from '@cardealer/types';

interface StaticPagesTableProps {
  pages: StaticPage[];
  loading: boolean;
  error: string | null;
  siteUrl: string;
  canWrite: boolean;
  canDelete: boolean;
  onDelete: (page: StaticPage) => void;
  onRetry: () => void;
  page: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (newPage: number) => void;
}

// WHY: Tách riêng Table Component cho danh sách Trang Tĩnh (Separation of Concerns & Unit Size Limit < 300 dòng).
// Quản trị 4-State UI Matrix: Loading Shimmer, Empty State, Error Alert và Data Grid.
export function StaticPagesTable({
  pages,
  loading,
  error,
  siteUrl,
  canWrite,
  canDelete,
  onDelete,
  onRetry,
  page,
  totalPages,
  totalItems,
  onPageChange,
}: StaticPagesTableProps) {
  if (error) {
    return (
      <Card className="p-4 bg-red-950/40 border border-red-500/20 rounded-xl text-red-300 text-sm flex items-center justify-between">
        <span>{error}</span>
        <Button variant="outline" size="sm" onClick={onRetry} className="border-red-500/30 text-red-300">
          Thử lại
        </Button>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-6 bg-slate-900/60 border border-white/10 rounded-xl space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-12 w-full bg-slate-800 rounded-lg" />
        ))}
      </Card>
    );
  }

  if (pages.length === 0) {
    return (
      <Card className="p-12 text-center bg-slate-900/40 border border-white/10 rounded-xl space-y-4">
        <FileText className="mx-auto text-slate-500" size={48} />
        <h3 className="text-lg font-medium text-white">Chưa có trang tĩnh nào</h3>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Bắt đầu tạo các trang quan trọng như /gioi-thieu, /chinh-sach-bao-mat, /quy-trinh-mua-xe để tối ưu Technical SEO.
        </p>
        {canWrite && (
          <Link href="/pages/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">Tạo Trang Đầu Tiên</Button>
          </Link>
        )}
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/60 border border-white/10 rounded-xl overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-800/60 border-b border-white/10">
          <TableRow>
            <TableHead className="text-slate-300">Tiêu Đề & Đường Dẫn</TableHead>
            <TableHead className="text-slate-300">Giao Diện (Template)</TableHead>
            <TableHead className="text-slate-300">Trạng Thái</TableHead>
            <TableHead className="text-slate-300">Schema Type</TableHead>
            <TableHead className="text-slate-300">Cập Nhật</TableHead>
            <TableHead className="text-right text-slate-300">Thao Tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pages.map((item) => (
            <TableRow key={item.id} className="border-b border-white/5 hover:bg-white/5">
              <TableCell>
                <div className="space-y-0.5">
                  <span className="font-medium text-white">{item.title}</span>
                  <div className="flex items-center gap-1.5 text-xs text-blue-400 font-mono">
                    <span>/{item.slug}</span>
                    {item.isPublished && (
                      <a
                        href={`${siteUrl}/${item.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline flex items-center"
                      >
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="border-white/10 text-slate-300">
                  {item.templateType}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={item.isPublished ? 'published' : 'draft'}>
                  {item.isPublished ? 'Đã Xuất Bản' : 'Bản Nháp'}
                </Badge>
              </TableCell>
              <TableCell className="text-xs text-slate-400 font-mono">
                {item.schemaType || 'WebPage'}
              </TableCell>
              <TableCell className="text-xs text-slate-400">
                {new Date(item.updatedAt).toLocaleDateString('vi-VN')}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {canWrite && (
                    <Link href={`/pages/${item.id}`}>
                      <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                        <Edit size={16} />
                      </Button>
                    </Link>
                  )}
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(item)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Phân Trang */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>Tổng số: {totalItems} trang</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(Math.max(1, page - 1))}
              className="border-white/10 text-white"
            >
              Trước
            </Button>
            <span>Trang {page} / {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              className="border-white/10 text-white"
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Globe, Plus, Search, RefreshCw } from 'lucide-react';
import { Button, Input, Card, Skeleton } from '@cardealer/ui';
import { clientEnv } from '@cardealer/env';
import { pagesService } from '../../services/pages.service';
import type { StaticPage, StaticPageTemplate } from '@cardealer/types';
import { ConfirmModal } from '../components/ConfirmModal';
import { useAuth } from '../../contexts/AuthContext';
import { AccessDenied } from '../components/AccessDenied';
import { StaticPagesTable } from '../../components/pages/StaticPagesTable';

// WHY: Trang danh sách Trang Tĩnh CMS Admin (apps/admin/app/pages/page.tsx).
// Kết nối với StaticPagesTable và ConfirmModal, tuân thủ RBAC Guard (pages:read/write/delete).
export default function StaticPagesListPage() {
  const { loading: authLoading, can } = useAuth();
  const [pages, setPages] = useState<StaticPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bộ lọc & phân trang
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [templateFilter, setTemplateFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal xóa
  const [deleteTarget, setDeleteTarget] = useState<StaticPage | null>(null);
  const [deleting, setDeleting] = useState(false);

  const siteUrl = clientEnv.NEXT_PUBLIC_SITE_URL;

  const fetchPages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await pagesService.listPages({
        page,
        limit: 15,
        search: searchQuery.trim() || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        templateType: templateFilter === 'all' ? undefined : (templateFilter as StaticPageTemplate),
      });
      setPages(res.items);
      setTotalPages(res.pagination.totalPages);
      setTotalItems(res.pagination.totalItems);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể tải danh sách trang tĩnh';
      setError(msg.replace(/[\r\n]/g, ' '));
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, statusFilter, templateFilter]);

  useEffect(() => {
    if (!authLoading && can('pages:read')) {
      fetchPages();
    }
  }, [authLoading, can, fetchPages]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await pagesService.deletePage(deleteTarget.id);
      setDeleteTarget(null);
      fetchPages();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi xóa trang tĩnh';
      alert(msg.replace(/[\r\n]/g, ' '));
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading) {
    return <div className="p-8"><Skeleton className="h-10 w-48 bg-slate-800" /></div>;
  }

  if (!can('pages:read')) {
    return <AccessDenied message="Bạn không có quyền xem danh sách trang tĩnh." />;
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="text-blue-500" size={26} />
            Quản Trị Trang Tĩnh & Technical SEO
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Quản lý các trang thông tin E-E-A-T, giới thiệu Showroom, chính sách và quy trình mua xe.
          </p>
        </div>

        {can('pages:write') && (
          <Link href="/pages/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
              <Plus size={18} />
              Tạo Trang Mới
            </Button>
          </Link>
        )}
      </div>

      {/* 2. Filters Bar */}
      <Card className="p-4 bg-slate-900/60 border border-white/10 rounded-xl flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <Input
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            placeholder="Tìm kiếm theo tiêu đề hoặc đường dẫn slug..."
            className="pl-9 bg-slate-800 border-white/10 text-white text-sm"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-sm text-white focus:outline-none"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="published">Đã xuất bản</option>
          <option value="draft">Bản nháp</option>
        </select>

        <select
          value={templateFilter}
          onChange={(e) => { setTemplateFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 bg-slate-800 border border-white/10 rounded-lg text-sm text-white focus:outline-none"
        >
          <option value="all">Tất cả giao diện</option>
          <option value="DEFAULT">Default Template</option>
          <option value="PROFILE_SHOWROOM">Profile Showroom</option>
          <option value="TIMELINE">Timeline / Quy trình</option>
          <option value="FINANCE">Finance / Trả góp</option>
          <option value="CONTACT">Contact / Liên hệ</option>
          <option value="FAQ">FAQ / Hỏi đáp</option>
        </select>

        <Button variant="ghost" onClick={fetchPages} className="text-slate-300 hover:text-white">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        </Button>
      </Card>

      {/* 3. Data Table Component */}
      <StaticPagesTable
        pages={pages}
        loading={loading}
        error={error}
        siteUrl={siteUrl}
        canWrite={can('pages:write')}
        canDelete={can('pages:delete')}
        onDelete={(item) => setDeleteTarget(item)}
        onRetry={fetchPages}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={(p) => setPage(p)}
      />

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmModal
          isOpen={!!deleteTarget}
          title="Xác nhận xóa trang tĩnh"
          message={`Bạn có chắc chắn muốn xóa trang "${deleteTarget.title}" (/${deleteTarget.slug})? Thao tác này không thể hoàn tác.`}
          confirmText="Xóa vĩnh viễn"
          cancelText="Hủy"
          variant="danger"
          loading={deleting}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

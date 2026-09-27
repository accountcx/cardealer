'use client';

// 🧠 Mental Model: Trang Quản Trị Chuyên Mục Tin Tức (apps/admin/app/categories/page.tsx).
// 1. Phù hợp 100% với Design System của Admin Shell (#0b0f17, glassmorphism, border-white/10, text-white).
// 2. RBAC Guard: Kiểm tra 'posts:read' để truy cập danh sách, 'posts:write' cho các thao tác tạo/sửa/xóa.
// 3. 4-State UI Matrix Chuẩn Mực:
//    - Loading State: Skeleton Shimmer giả lập toàn diện bảng dữ liệu triệt tiêu CLS.
//    - Empty State: Minh họa trực quan khi chưa có chuyên mục hoặc không khớp từ khóa tìm kiếm.
//    - Error State: Banner cảnh báo lỗi chi tiết kèm nút Thử lại (onRetry).
//    - Data State: Bảng dữ liệu hiển thị Tên chuyên mục, Slug kèm link preview SEO, Thứ tự hiển thị, Số lượng bài viết (postCount) và Action Toolbar.
// 4. Tích hợp Dual-Modal:
//    - CategoryModal: Tạo mới / Chỉnh sửa chuyên mục với auto-slug tiếng Việt chuẩn SEO.
//    - DeleteCategoryModal: Dual-Layer Restrict Guard ngăn chặn xóa danh mục đang có bài viết.

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  FolderTree,
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  ExternalLink,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  Layers,
  ArrowUpDown,
  Tag,
  BookOpen,
} from 'lucide-react';
import {
  Button,
  Input,
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
import { clientEnv } from '@cardealer/env';
import type { CategoryDTO } from '@cardealer/types';
import { categoryService } from '../../services/category.service';
import { CategoryModal } from './CategoryModal';
import { DeleteCategoryModal } from './DeleteCategoryModal';
import { useAuth } from '../../contexts/AuthContext';
import { AccessDenied } from '../components/AccessDenied';

interface ActionNotification {
  type: 'success' | 'error';
  title: string;
  message: string;
}

export default function CategoriesManagementPage() {
  const { user, loading: authLoading, can } = useAuth();

  // State dữ liệu
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<ActionNotification | null>(null);

  // State tìm kiếm & lọc
  const [searchQuery, setSearchQuery] = useState('');

  // State Modal Tạo/Sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDTO | null>(null);

  // State Modal Xóa
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<CategoryDTO | null>(null);

  // Tự tắt notification sau 4 giây
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => {
      setNotification(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [notification]);

  // Tải danh sách chuyên mục
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await categoryService.getCategories();
      if (Array.isArray(res)) {
        setCategories(res);
      } else {
        setCategories([]);
      }
    } catch (err: unknown) {
      const errObj = err as { message?: string };
      setError(errObj.message || 'Không thể tải danh sách chuyên mục. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Lọc dữ liệu theo từ khóa tìm kiếm (Tên chuyên mục hoặc Slug)
  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return categories;
    return categories.filter(
      (cat) =>
        cat.tenChuyenMuc.toLowerCase().includes(query) ||
        cat.slug.toLowerCase().includes(query) ||
        (cat.moTa && cat.moTa.toLowerCase().includes(query))
    );
  }, [categories, searchQuery]);

  // Tổng số lượng bài viết trên toàn bộ chuyên mục
  const totalPostsAcrossCategories = useMemo(() => {
    return categories.reduce((sum, cat) => sum + (cat.postCount ?? 0), 0);
  }, [categories]);

  // Handlers Modal Tạo/Sửa
  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: CategoryDTO) => {
    setEditingCategory(cat);
    setIsModalOpen(true);
  };

  const handleModalSuccess = (savedCat: CategoryDTO) => {
    setIsModalOpen(false);
    const isEdit = Boolean(editingCategory);
    setNotification({
      type: 'success',
      title: isEdit ? 'Cập nhật thành công' : 'Thêm mới thành công',
      message: `Chuyên mục "${savedCat.tenChuyenMuc}" đã được lưu thành công.`,
    });
    fetchCategories();
  };

  // Handlers Modal Xóa
  const handleOpenDeleteModal = (cat: CategoryDTO) => {
    setDeletingCategory(cat);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSuccess = (deletedId: string) => {
    setIsDeleteModalOpen(false);
    setCategories((prev) => prev.filter((item) => item.id !== deletedId));
    setNotification({
      type: 'success',
      title: 'Đã xóa chuyên mục',
      message: 'Chuyên mục đã được gỡ bỏ khỏi hệ thống thành công.',
    });
  };

  // RBAC Guards
  if (authLoading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-10 bg-white/5 rounded-xl w-1/3" />
        <div className="h-64 bg-white/5 rounded-2xl w-full" />
      </div>
    );
  }

  if (!can('posts:read')) {
    return (
      <AccessDenied
        title="Không có quyền truy cập Chuyên mục"
        message="Tài khoản của bạn cần có quyền 'posts:read' để xem phân hệ Quản lý Chuyên mục Tin tức."
        requiredPermission="posts:read"
      />
    );
  }

  const canWrite = can('posts:write');
  const siteUrl = clientEnv.NEXT_PUBLIC_SITE_URL || 'https://xehyundaivinh.com';

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Header & Page Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400">
              <FolderTree size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-white tracking-tight">Quản Lý Chuyên Mục</h1>
                <Badge variant="outline" className="text-xs bg-white/5 border-white/10 text-white/70">
                  {categories.length} chuyên mục
                </Badge>
              </div>
              <p className="text-sm text-white/50 mt-1">
                Phân loại bài viết, tin tức showroom Hyundai và tối ưu cấu trúc URL SEO 1 tầng.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchCategories}
            disabled={loading}
            className="text-white/70 hover:text-white hover:bg-white/10"
            title="Tải lại danh sách"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline ml-1.5">Làm mới</span>
          </Button>

          {canWrite && (
            <Button
              variant="default"
              size="sm"
              onClick={handleOpenCreateModal}
              className="bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/20"
            >
              <Plus size={16} className="mr-1.5" />
              Thêm Chuyên Mục
            </Button>
          )}
        </div>
      </div>

      {/* 2. Banner Notification Feedback */}
      {notification && (
        <div
          className={`flex items-start justify-between gap-3 p-4 rounded-xl border transition-all animate-in fade-in slide-in-from-top-2 duration-300 ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}
        >
          <div className="flex items-start gap-3">
            {notification.type === 'success' ? (
              <CheckCircle2 size={20} className="shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="text-sm font-semibold">{notification.title}</h4>
              <p className="text-xs opacity-90 mt-0.5">{notification.message}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setNotification(null)}
            className="h-7 w-7 text-white/40 hover:text-white hover:bg-white/10 shrink-0"
            title="Đóng thông báo"
          >
            <X size={16} />
          </Button>
        </div>
      )}

      {/* 3. Quick Stats & Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* KPI Mini-Card 1: Tổng chuyên mục */}
        <Card className="p-4 bg-white/[0.02] border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
            <Layers size={20} />
          </div>
          <div>
            <div className="text-xs text-white/50 font-medium">Tổng Chuyên Mục</div>
            <div className="text-xl font-bold text-white mt-0.5">{categories.length}</div>
          </div>
        </Card>

        {/* KPI Mini-Card 2: Tổng bài viết phân bổ */}
        <Card className="p-4 bg-white/[0.02] border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <BookOpen size={20} />
          </div>
          <div>
            <div className="text-xs text-white/50 font-medium">Bài Viết Đã Phân Loại</div>
            <div className="text-xl font-bold text-white mt-0.5">{totalPostsAcrossCategories}</div>
          </div>
        </Card>

        {/* Search Input Bar (Spans 2 cols on desktop) */}
        <div className="md:col-span-2 flex items-center">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <Input
              type="text"
              placeholder="Tìm theo tên chuyên mục, slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 bg-white/[0.03] border-white/10 text-white placeholder:text-white/30 w-full focus:border-primary-500"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchQuery('')}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 text-white/40 hover:text-white hover:bg-white/10"
                title="Xóa tìm kiếm"
              >
                <X size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 4. 4-State UI Matrix Content */}
      {/* State A: Error State */}
      {error && !loading && (
        <Card className="p-8 border-rose-500/20 bg-rose-500/5 text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-base font-semibold text-white">Không thể tải dữ liệu chuyên mục</h3>
          <p className="text-sm text-white/60 max-w-md mt-1 mb-4">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchCategories} className="border-white/20 text-white">
            <RefreshCw size={14} className="mr-1.5" />
            Thử Lại Ngay
          </Button>
        </Card>
      )}

      {/* State B: Loading Shimmer Skeleton */}
      {loading && (
        <div className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.02]">
          <div className="p-4 border-b border-white/10">
            <Skeleton className="h-6 w-48 bg-white/5" />
          </div>
          <div className="divide-y divide-white/5">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="p-4 flex items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-1/4 bg-white/5" />
                  <Skeleton className="h-4 w-1/3 bg-white/5" />
                </div>
                <Skeleton className="h-6 w-20 bg-white/5" />
                <Skeleton className="h-8 w-24 bg-white/5" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* State C: Empty State */}
      {!loading && !error && filteredCategories.length === 0 && (
        <Card className="p-12 border-dashed border-white/15 bg-white/[0.01] text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 mb-4">
            <FolderTree size={32} />
          </div>
          {searchQuery ? (
            <>
              <h3 className="text-lg font-semibold text-white">Không tìm thấy chuyên mục phù hợp</h3>
              <p className="text-sm text-white/50 max-w-sm mt-1 mb-4">
                Không có chuyên mục nào khớp với từ khóa &ldquo;{searchQuery}&rdquo;. Vui lòng thử từ khóa khác.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="border-white/20 text-white"
              >
                Xóa bộ lọc tìm kiếm
              </Button>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-white">Chưa có chuyên mục bài viết nào</h3>
              <p className="text-sm text-white/50 max-w-sm mt-1 mb-4">
                Tạo chuyên mục đầu tiên để bắt đầu phân loại tin tức, đánh giá xe và tối ưu SEO cho showroom.
              </p>
              {canWrite && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleOpenCreateModal}
                  className="bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/20"
                >
                  <Plus size={16} className="mr-1.5" />
                  Thêm Chuyên Mục Đầu Tiên
                </Button>
              )}
            </>
          )}
        </Card>
      )}

      {/* State D: Data State Table */}
      {!loading && !error && filteredCategories.length > 0 && (
        <div className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.02] shadow-xl backdrop-blur-sm">
          <Table>
            <TableHeader className="bg-white/[0.03]">
              <TableRow className="border-b border-white/10 hover:bg-transparent">
                <TableHead className="text-white/60 font-medium py-3.5 px-4 text-left">
                  Tên Chuyên Mục
                </TableHead>
                <TableHead className="text-white/60 font-medium py-3.5 px-4 text-left">
                  Đường Dẫn SEO (Slug)
                </TableHead>
                <TableHead className="text-white/60 font-medium py-3.5 px-4 text-center w-28">
                  Thứ Tự
                </TableHead>
                <TableHead className="text-white/60 font-medium py-3.5 px-4 text-center w-36">
                  Số Bài Viết
                </TableHead>
                <TableHead className="text-white/60 font-medium py-3.5 px-4 text-right w-32">
                  Thao Tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-white/5">
              {filteredCategories.map((category) => {
                const postCount = category.postCount ?? 0;
                const storefrontUrl = `${siteUrl}/tin-tuc?category=${encodeURIComponent(category.slug)}`;

                return (
                  <TableRow
                    key={category.id}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* Cột 1: Tên Chuyên Mục */}
                    <TableCell className="py-4 px-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary-500/10 border border-primary-500/20 text-primary-400 shrink-0 mt-0.5">
                          <Tag size={16} />
                        </div>
                        <div>
                          <span className="font-semibold text-white group-hover:text-primary-400 transition-colors">
                            {category.tenChuyenMuc}
                          </span>
                          {category.moTa ? (
                            <p className="text-xs text-white/50 line-clamp-1 mt-0.5 max-w-md">
                              {category.moTa}
                            </p>
                          ) : (
                            <p className="text-xs text-white/30 italic mt-0.5">Chưa có mô tả</p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Cột 2: Slug & Preview Link */}
                    <TableCell className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs font-mono text-white/80">
                          {category.slug}
                        </code>
                        <a
                          href={storefrontUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-white/30 hover:text-primary-400 hover:bg-white/5 rounded transition-colors"
                          title={`Xem chuyên mục trên website: ${storefrontUrl}`}
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </TableCell>

                    {/* Cột 3: Thứ Tự Hiển Thị */}
                    <TableCell className="py-4 px-4 text-center">
                      <span className="text-sm font-medium text-white/70">
                        {category.sortOrder ?? 0}
                      </span>
                    </TableCell>

                    {/* Cột 4: Số Lượng Bài Viết (postCount) */}
                    <TableCell className="py-4 px-4 text-center">
                      {postCount > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-sky-500/10 border border-sky-500/20 text-sky-400">
                          <FileText size={12} />
                          {postCount} bài viết
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-white/40">
                          0 bài viết
                        </span>
                      )}
                    </TableCell>

                    {/* Cột 5: Action Toolbar */}
                    <TableCell className="py-4 px-4 text-right">
                      {canWrite ? (
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEditModal(category)}
                            className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10"
                            title="Chỉnh sửa chuyên mục"
                          >
                            <Edit size={15} />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDeleteModal(category)}
                            className="h-8 w-8 p-0 text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10"
                            title={
                              postCount > 0
                                ? `Không thể xóa (Đang có ${postCount} bài viết)`
                                : 'Xóa chuyên mục'
                            }
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-white/30 italic">Chỉ xem</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* 5. Modals Integration */}
      {/* Modal Thêm mới & Chỉnh sửa */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
        onSuccess={handleModalSuccess}
      />

      {/* Modal Xóa kèm Restrict Guard */}
      <DeleteCategoryModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        category={deletingCategory}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}

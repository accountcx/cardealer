'use client';

// 🧠 Mental Model: Trang Quản Trị Danh Sách Bài Viết & Inbound Marketing Hub (apps/admin).
// 1. Phù hợp 100% với Design System của Admin Shell (#0b0f17, glassmorphism, border-white/10, text-white).
// 2. RBAC Guard: Kiểm tra 'posts:read' để truy cập danh sách, 'posts:write' cho các thao tác tạo/sửa/xóa.
// 3. 4-State UI Matrix Chuẩn Mực:
//    - Loading State: Skeleton Shimmer giả lập toàn diện bảng dữ liệu triệt tiêu CLS.
//    - Empty State: Minh họa chuyên nghiệp khi không có bài viết hoặc không khớp bộ lọc + CTA Tạo bài mới.
//    - Error State: Banner cảnh báo lỗi chi tiết kèm nút Thử lại (onRetry).
//    - Data State: Bảng dữ liệu hiển thị ảnh đại diện, tiêu đề, chuyên mục, tác giả, trạng thái, lượt xem, thời gian đọc.
// 4. Thao tác nhanh 1 chạm:
//    - Xem trước bài viết bí mật với previewToken (Copy link / Mở tab mới).
//    - Chỉnh sửa bài viết trong Tiptap WYSIWYG Editor.
//    - Xóa bài viết an toàn qua ConfirmModal kính mờ.

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import {
  Button,
  Input,
  Badge,
  Card,
  Skeleton,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@cardealer/ui';
import { postService, type PostItem, type CategoryItem } from '../../services/post.service';
import { ConfirmModal } from '../components/ConfirmModal';
import { useAuth } from '../../contexts/AuthContext';
import { AccessDenied } from '../components/AccessDenied';

type PostFilterStatus = 'all' | 'published' | 'draft' | 'scheduled' | 'archived';

interface ActionNotification {
  type: 'success' | 'error';
  title: string;
  message: string;
}

export default function PostsManagementPage() {
  const { user, loading: authLoading, can } = useAuth();

  // State dữ liệu
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<ActionNotification | null>(null);

  // Bộ lọc & Phân trang
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [statusFilter, setStatusFilter] = useState<PostFilterStatus>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // State Xóa bài viết
  const [deleteTarget, setDeleteTarget] = useState<PostItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  // State Copy Link Preview
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Debounce search input (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset trang khi đổi từ khóa
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Tải danh mục bài viết 1 lần
  useEffect(() => {
    let isMounted = true;
    postService
      .getCategories()
      .then((res) => {
        if (isMounted && res.success && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      })
      .catch((err) => console.error('[Posts Page] Lỗi tải chuyên mục:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  // Tải danh sách bài viết
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, any> = {
        page,
        limit,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (selectedCategory !== 'all') {
        params.categoryId = selectedCategory;
      }
      if (debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      const res = await postService.getPosts(params);
      if (res && Array.isArray(res.data)) {
        setPosts(res.data);
        if (res.pagination) {
          setTotalItems(res.pagination.totalItems);
          setTotalPages(res.pagination.totalPages || 1);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải danh sách bài viết';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [page, limit, statusFilter, selectedCategory, debouncedSearch]);

  useEffect(() => {
    if (!authLoading && can('posts:read')) {
      fetchPosts();
    }
  }, [authLoading, can, fetchPosts]);

  // Xóa bài viết
  const handleDeletePost = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await postService.deletePost(deleteTarget.id);
      setNotification({
        type: 'success',
        title: 'Thành công',
        message: `Đã xóa bài viết "${deleteTarget.tieuDe}"`,
      });
      setDeleteTarget(null);
      fetchPosts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi khi xóa bài viết';
      setNotification({
        type: 'error',
        title: 'Thất bại',
        message: msg,
      });
    } finally {
      setDeleting(false);
    }
  };

  // Copy Preview URL
  const handleCopyPreview = (post: PostItem) => {
    if (!post.previewToken) return;
    const previewUrl = `${window.location.origin.replace(':3001', ':3002')}/tin-tuc/preview?token=${post.previewToken}`;
    navigator.clipboard.writeText(previewUrl);
    setCopiedId(post.id);
    setTimeout(() => setCopiedId(null), 2500);
    setNotification({
      type: 'success',
      title: 'Đã sao chép liên kết xem trước',
      message: 'Liên kết xem trước bài viết nháp đã được lưu vào khay nhớ tạm.',
    });
  };

  // Render Status Badge
  const renderStatusBadge = (status: PostItem['status']) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Đã xuất bản
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Bản nháp
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Hẹn giờ
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            Lưu trữ
          </span>
        );
      default:
        return null;
    }
  };

  // RBAC Guard
  if (authLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64 bg-slate-800" />
        <Skeleton className="h-64 w-full bg-slate-800" />
      </div>
    );
  }

  if (!can('posts:read')) {
    return <AccessDenied message="Bạn không có quyền xem và quản lý bài viết tin tức." />;
  }

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100 tracking-tight flex items-center gap-3">
            <BookOpen className="text-cyan-400" size={28} />
            Quản Lý Bài Viết & Inbound Hub
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Biên tập bài viết chuẩn SEO Onpage, chèn Content Blocks tinh hoa và theo dõi khách hàng tiềm năng.
          </p>
        </div>

        {can('posts:write') && (
          <Link href="/posts/new">
            <Button
              variant="accent"
              className="w-full sm:w-auto flex items-center justify-center gap-2 h-11 px-5 font-semibold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all"
            >
              <Plus size={18} />
              Viết bài mới
            </Button>
          </Link>
        )}
      </div>

      {/* Action Notification Toast */}
      {notification && (
        <div
          className={`flex items-start justify-between p-4 rounded-xl border backdrop-blur-md transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : 'bg-red-500/10 border-red-500/20 text-red-300'
          }`}
        >
          <div className="flex items-start gap-3">
            {notification.type === 'success' ? (
              <CheckCircle2 size={20} className="shrink-0 text-emerald-400 mt-0.5" />
            ) : (
              <AlertCircle size={20} className="shrink-0 text-red-400 mt-0.5" />
            )}
            <div>
              <p className="font-semibold text-sm">{notification.title}</p>
              <p className="text-xs opacity-90 mt-0.5">{notification.message}</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-200 h-7 w-7 p-0 shrink-0"
            aria-label="Đóng thông báo"
          >
            <X size={16} />
          </Button>
        </div>
      )}

      {/* 2. Interactive Filter Bar */}
      <Card className="p-4 md:p-6 bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl space-y-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
          {[
            { key: 'all', label: 'Tất cả trạng thái' },
            { key: 'published', label: 'Đã xuất bản' },
            { key: 'draft', label: 'Bản nháp' },
            { key: 'scheduled', label: 'Hẹn giờ' },
            { key: 'archived', label: 'Lưu trữ' },
          ].map((tab) => (
            <Button
              key={tab.key}
              type="button"
              variant={statusFilter === tab.key ? 'accent' : 'ghost'}
              size="sm"
              onClick={() => {
                setStatusFilter(tab.key as PostFilterStatus);
                setPage(1);
              }}
              className={`rounded-xl text-xs md:text-sm font-semibold h-9 px-4 transition-all ${
                statusFilter === tab.key
                  ? 'shadow-[0_0_15px_rgba(0,114,206,0.3)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
          {/* Search Box */}
          <div className="md:col-span-8">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài viết theo tiêu đề..."
              leftIcon={<Search size={18} />}
              className="h-11 rounded-xl bg-slate-950/60 border-white/10 text-slate-100 placeholder:text-slate-500 text-sm focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500/60"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-4">
            <Select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              variant="dark"
              options={[
                { value: 'all', label: 'Tất cả chuyên mục' },
                ...categories.map((cat) => ({ value: cat.id, label: cat.tenChuyenMuc })),
              ]}
              className="h-11 rounded-xl bg-slate-950/60 border-white/10 text-slate-200 text-sm focus-visible:ring-cyan-500/20 focus-visible:border-cyan-500/60"
            />
          </div>
        </div>
      </Card>

      {/* 3. 4-State UI Data Presentation */}
      <Card className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {/* Loading State */}
        {loading && (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-none">
                <Skeleton className="w-16 h-12 rounded-lg bg-slate-800 shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-3/4 bg-slate-800" />
                  <Skeleton className="h-4 w-1/3 bg-slate-850" />
                </div>
                <Skeleton className="w-24 h-6 rounded-full bg-slate-800" />
                <Skeleton className="w-20 h-8 rounded-lg bg-slate-800" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center">
              <AlertCircle size={28} />
            </div>
            <div className="max-w-md">
              <h3 className="text-lg font-bold text-slate-100">Đã xảy ra lỗi khi tải dữ liệu</h3>
              <p className="text-sm text-slate-400 mt-1">{error}</p>
            </div>
            <Button
              variant="secondary"
              onClick={fetchPosts}
              className="flex items-center gap-2 h-11 px-5 font-semibold text-sm"
            >
              <RefreshCw size={16} />
              Thử lại
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && posts.length === 0 && (
          <div className="p-12 md:p-16 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 text-slate-400 border border-white/10 flex items-center justify-center">
              <FileText size={32} />
            </div>
            <div className="max-w-md">
              <h3 className="text-lg font-bold text-slate-100">Chưa có bài viết nào</h3>
              <p className="text-sm text-slate-400 mt-1">
                {searchQuery || statusFilter !== 'all' || selectedCategory !== 'all'
                  ? 'Không tìm thấy bài viết nào phù hợp với bộ lọc hiện tại. Vui lòng thử tìm kiếm khác.'
                  : 'Bắt đầu xuất bản các bài đánh giá xe, tin khuyến mãi và cẩm nang để tăng trưởng lượng truy cập.'}
              </p>
            </div>
            {can('posts:write') && (
              <Link href="/posts/new">
                <Button variant="accent" className="flex items-center gap-2 h-11 px-5 font-semibold text-sm">
                  <Plus size={18} />
                  Tạo bài viết đầu tiên
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Data State: Posts Table */}
        {!loading && !error && posts.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow isHeader className="bg-white/[0.02] border-b border-white/10">
                <TableHead className="py-4 px-6 text-slate-400 font-semibold">Bài viết</TableHead>
                <TableHead className="py-4 px-4 text-slate-400 font-semibold">Chuyên mục</TableHead>
                <TableHead className="py-4 px-4 text-slate-400 font-semibold">Tác giả</TableHead>
                <TableHead className="py-4 px-4 text-center text-slate-400 font-semibold">Trạng thái</TableHead>
                <TableHead className="py-4 px-4 text-center text-slate-400 font-semibold">Thống kê</TableHead>
                <TableHead className="py-4 px-4 text-center text-slate-400 font-semibold">Ngày tạo</TableHead>
                <TableHead className="py-4 px-6 text-right text-slate-400 font-semibold">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-white/5 text-sm">
              {posts.map((post) => (
                <TableRow
                  key={post.id}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  {/* Thumbnail & Title */}
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-3.5 max-w-md">
                      <img
                        src={post.anhDaiDienUrl}
                        alt={post.anhDaiDienAlt || post.tieuDe}
                        className="w-16 h-12 rounded-lg object-cover bg-slate-800 border border-white/10 shrink-0"
                        onError={(e) => {
                          // Fallback image
                          (e.target as HTMLImageElement).src = '/images/placeholder-car.webp';
                        }}
                      />
                      <div className="min-w-0">
                        <Link
                          href={`/posts/${post.id}`}
                          className="font-bold text-slate-100 hover:text-cyan-400 transition-colors line-clamp-2 leading-snug"
                        >
                          {post.tieuDe}
                        </Link>
                        <span className="text-xs text-slate-500 font-mono block mt-1 truncate">
                          /{post.slug}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Category */}
                  <TableCell className="py-4 px-4 whitespace-nowrap">
                    {post.category ? (
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300 border border-white/10">
                        {post.category.tenChuyenMuc}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">Chưa phân loại</span>
                    )}
                  </TableCell>

                  {/* Author */}
                  <TableCell className="py-4 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-slate-300">
                      <User size={14} className="text-slate-500 shrink-0" />
                      <span className="text-xs font-medium">
                        {post.author?.fullName || 'Ban Biên Tập'}
                      </span>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-4 px-4 text-center whitespace-nowrap">
                    {renderStatusBadge(post.status)}
                  </TableCell>

                  {/* Stats: Views, Words, Reading Time */}
                  <TableCell className="py-4 px-4 text-center whitespace-nowrap">
                    <div className="inline-flex flex-col items-center gap-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-semibold text-slate-200">
                        <Eye size={13} className="text-cyan-400" />
                        {post.viewCount.toLocaleString('vi-VN')}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {post.wordCount} từ • {post.readingTime}p đọc
                      </span>
                    </div>
                  </TableCell>

                  {/* Date */}
                  <TableCell className="py-4 px-4 text-center whitespace-nowrap text-xs text-slate-400 font-mono">
                    {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="py-4 px-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Copy Preview Link */}
                      {post.previewToken && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyPreview(post)}
                          title="Sao chép link xem trước bài viết"
                          className="h-8 w-8 text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                        >
                          {copiedId === post.id ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                        </Button>
                      )}

                      {/* Edit Button */}
                      {can('posts:write') && (
                        <Link href={`/posts/${post.id}`}>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="Chỉnh sửa bài viết"
                            className="h-8 w-8 text-slate-400 hover:text-amber-300 hover:bg-amber-500/10"
                          >
                            <Edit size={16} />
                          </Button>
                        </Link>
                      )}

                      {/* Delete Button */}
                      {can('posts:write') && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTarget(post)}
                          title="Xóa bài viết"
                          className="h-8 w-8 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
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
        )}

        {/* Pagination Footer */}
        {!loading && !error && posts.length > 0 && totalPages > 1 && (
          <div className="p-4 md:p-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-400">
              Hiển thị <span className="text-slate-200 font-semibold">{posts.length}</span> trên tổng số{' '}
              <span className="text-slate-200 font-semibold">{totalItems}</span> bài viết
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="h-9 px-3 text-xs"
              >
                <ChevronLeft size={16} />
                Trước
              </Button>
              <span className="text-xs font-semibold px-3 text-slate-300">
                Trang {page} / {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="h-9 px-3 text-xs"
              >
                Sau
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeletePost}
        title="Xác nhận xóa bài viết"
        message={`Bạn có chắc chắn muốn xóa bài viết "${deleteTarget?.tieuDe}"? Thao tác này sẽ gỡ bài viết khỏi hệ thống và không thể hoàn tác.`}
        confirmText="Xóa bài viết"
        cancelText="Hủy bỏ"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}

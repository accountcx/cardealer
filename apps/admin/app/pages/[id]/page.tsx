'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronLeft,
  Save,
  Send,
  AlertCircle,
  Globe,
} from 'lucide-react';
import { Button, Input, Card, Skeleton } from '@cardealer/ui';
import { useAuth } from '../../../contexts/AuthContext';
import { AccessDenied } from '../../components/AccessDenied';
import { usePageEditor } from './hooks/usePageEditor';
import { PageSeoSidebar } from '../../../components/pages/PageSeoSidebar';
import { PageBlocksEditor } from '../../../components/pages/PageBlocksEditor';
import { MediaPickerModal } from '../../components/MediaPickerModal';

// WHY: Giao diện Soạn Thảo Trang Tĩnh 2 cột (Layout 8/4: Content Blocks AST & Technical SEO).
// Tích hợp PageBlocksEditor chuẩn E-E-A-T và MediaPickerModal, tuân thủ RBAC 'pages:write'.
export default function PageEditorPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string | undefined);
  const { loading: authLoading, can } = useAuth();
  const editor = usePageEditor(id);

  if (authLoading || editor.loading) {
    return (
      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <Skeleton className="h-10 w-48 bg-slate-800" />
        <div className="grid grid-cols-12 gap-8">
          <Skeleton className="col-span-8 h-[600px] bg-slate-800 rounded-2xl" />
          <Skeleton className="col-span-4 h-[600px] bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!can('pages:write')) {
    return <AccessDenied message="Bạn không có quyền chỉnh sửa hoặc tạo mới trang tĩnh." />;
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. Top Header Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Link href="/pages">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <ChevronLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Globe className="text-blue-500" size={22} />
              {editor.isNew ? 'Tạo Trang Tĩnh Mới' : `Chỉnh Sửa: ${editor.title || 'Trang tĩnh'}`}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Soạn thảo khối nội dung E-E-A-T và bộ siêu dữ liệu Technical SEO chuẩn Google SERP.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            disabled={editor.saving}
            onClick={() => editor.handleSave(false)}
            className="border-white/10 text-slate-300 hover:text-white"
          >
            <Save size={16} className="mr-1.5" />
            Lưu Bản Nháp
          </Button>

          <Button
            disabled={editor.saving}
            onClick={() => editor.handleSave(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            <Send size={16} className="mr-1.5" />
            {editor.isPublished ? 'Cập Nhật Trang' : 'Xuất Bản Ngay'}
          </Button>
        </div>
      </div>

      {/* 2. Error Banner */}
      {editor.error && (
        <Card className="p-4 bg-red-950/40 border border-red-500/30 rounded-xl text-red-300 text-sm flex items-center gap-3">
          <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
          <span>{editor.error}</span>
        </Card>
      )}

      {/* 3. Form 2 Cột: Cột Trái (8) Nội Dung Blocks, Cột Phải (4) SEO & Xuất Bản */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* CỘT TRÁI (8 CỘT) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Thông tin cơ bản: Tiêu đề & Slug */}
          <Card className="p-6 bg-slate-900/60 border border-white/10 rounded-2xl space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">
                Tiêu Đề Trang <span className="text-red-400">*</span>
              </label>
              <Input
                value={editor.title}
                onChange={(e) => editor.handleTitleChange(e.target.value)}
                placeholder="Ví dụ: Giới Thiệu Showroom Hyundai Vinh"
                className="bg-slate-800 border-white/10 text-white text-base py-3"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-white">
                Đường Dẫn Truy Cập (Slug) <span className="text-red-400">*</span>
              </label>
              <Input
                value={editor.slug}
                onChange={(e) => editor.handleSlugChange(e.target.value)}
                placeholder="gioi-thieu"
                className="bg-slate-800 border-white/10 text-blue-400 font-mono text-sm"
              />
              <p className="text-xs text-slate-400">
                Slug duy nhất định tuyến toàn hệ thống. Không được trùng với các từ khóa hệ thống.
              </p>
            </div>
          </Card>

          {/* Visual Content Block Editor tương tự bài viết */}
          <PageBlocksEditor
            blocks={editor.blocks}
            availableCars={editor.availableCars}
            onAddBlock={editor.addBlock}
            onMoveBlock={editor.moveBlock}
            onRemoveBlock={editor.removeBlock}
            onUpdateBlock={editor.updateBlock}
            onOpenMediaPicker={(target) => editor.setMediaPickerTarget(target)}
          />
        </div>

        {/* CỘT PHẢI (4 CỘT) */}
        <div className="lg:col-span-4">
          <PageSeoSidebar
            title={editor.title}
            slug={editor.slug}
            templateType={editor.templateType}
            setTemplateType={editor.setTemplateType}
            isPublished={editor.isPublished}
            setIsPublished={editor.setIsPublished}
            metaTitle={editor.metaTitle}
            setMetaTitle={editor.setMetaTitle}
            metaDescription={editor.metaDescription}
            setMetaDescription={editor.setMetaDescription}
            canonicalUrl={editor.canonicalUrl}
            setCanonicalUrl={editor.setCanonicalUrl}
            ogImage={editor.ogImage}
            setOgImage={editor.setOgImage}
            noIndex={editor.noIndex}
            setNoIndex={editor.setNoIndex}
            schemaType={editor.schemaType}
            setSchemaType={editor.setSchemaType}
          />
        </div>
      </div>

      {/* Media Picker Modal cho ảnh đơn / ảnh gallery / OG image */}
      {editor.mediaPickerTarget && (
        <MediaPickerModal
          isOpen={!!editor.mediaPickerTarget}
          onClose={() => editor.setMediaPickerTarget(null)}
          onSelect={editor.handleMediaSelect}
          mode={editor.mediaPickerTarget.type === 'gallery' ? 'multiple' : 'single'}
          title="Chọn hình ảnh từ Thư viện Showroom"
        />
      )}
    </div>
  );
}

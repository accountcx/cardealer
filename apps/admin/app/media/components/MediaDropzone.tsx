'use client';

import React, { useRef, useState, useCallback } from 'react';
import { UploadCloud, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Button, Input } from '@cardealer/ui';

// 🧠 Mental Model: Vùng kéo thả tệp tải lên (Drag & Drop Zone).
// - Lắng nghe sự kiện dragover, dragleave, drop với visual feedback mượt mà.
// - Lọc tệp hợp lệ (JPEG, PNG, WEBP, GIF, SVG) và giới hạn tối đa 10MB.
// - Thông báo cảnh báo tức thì nếu tệp vượt quá dung lượng cho phép.

const ACCEPTED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export interface MediaDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export function MediaDropzone({
  onFilesSelected,
  disabled = false,
}: MediaDropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndEmit = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      const validFiles: File[] = [];
      const errors: string[] = [];

      files.forEach((file) => {
        if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
          errors.push(`"${file.name}" không phải định dạng ảnh được hỗ trợ.`);
          return;
        }
        if (file.size > MAX_FILE_SIZE_BYTES) {
          errors.push(
            `"${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)}MB) vượt quá giới hạn tối đa 10MB.`
          );
          return;
        }
        validFiles.push(file);
      });

      if (errors.length > 0) {
        setWarning(errors[0]);
      } else {
        setWarning(null);
      }

      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    },
    [onFilesSelected]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (disabled) return;
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      validateAndEmit(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndEmit(e.target.files);
      // Reset input value để có thể chọn lại cùng 1 file
      e.target.value = '';
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 cursor-pointer ${
          disabled
            ? 'cursor-not-allowed opacity-60 border-slate-300 dark:border-slate-800'
            : isDragActive
            ? 'border-indigo-600 bg-indigo-50/60 dark:border-indigo-500 dark:bg-indigo-950/30 ring-4 ring-indigo-500/10'
            : 'border-slate-300 bg-slate-50/60 hover:border-indigo-400 hover:bg-indigo-50/30 dark:border-slate-700/80 dark:bg-slate-900/40 dark:hover:border-indigo-500/50'
        }`}
      >
        <Input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_MIME_TYPES.join(',')}
          onChange={handleFileInputChange}
          disabled={disabled}
          className="hidden"
        />

        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-200 ${
            isDragActive
              ? 'scale-110 bg-indigo-600 text-white shadow-md'
              : 'bg-indigo-100/80 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400'
          }`}
        >
          <UploadCloud className="h-7 w-7" />
        </div>

        <div className="mt-4 space-y-1">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {isDragActive
              ? 'Thả ảnh vào đây để tải lên...'
              : 'Kéo thả ảnh vào đây, hoặc click để duyệt tệp'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hỗ trợ PNG, JPG, WEBP, GIF, SVG (Tối đa 10MB / tệp)
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          leftIcon={<ImageIcon className="h-3.5 w-3.5 text-indigo-500" />}
          className="mt-4"
        >
          Chọn Tệp Từ Thiết Bị
        </Button>
      </div>

      {warning && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>{warning}</span>
        </div>
      )}
    </div>
  );
}

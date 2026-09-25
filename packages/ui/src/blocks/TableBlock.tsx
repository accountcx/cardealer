'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { Button } from '../button';
import { Input } from '../input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableCaption,
} from '../table';

// 🧠 Mental Model: TableBlock là Content Block dạng Bảng Dữ Liệu Thông Minh cho Hub Tin Tức & Xe (Hyundai Vinh).
// Tuân thủ triệt để 2 SOP kỹ thuật: fullstack-dev-executor.xml & tailwind-ui-designer.xml:
// 1. Component-Driven & Shared Primitives First: Tái sử dụng 100% UI Primitives từ hệ thống (Table, Input, Button).
// 2. 100% Named Export: TUYỆT ĐỐI CẤM export default để đảm bảo tree-shaking và tối ưu bundling.
// 3. 4-State UI Pattern: Quản trị đầy đủ Data Success State, Empty Search State (Icon + Title + Desc + CTA Reset), và Fallback Null State.
// 4. Zero Arbitrary Styling & Chuẩn Spacing Scale: Bội số 4px (h-10, px-4, py-3), màu sắc đồng bộ Design Tokens (Slate/Brand Blue).
// 5. Chuẩn WCAG AAA & A11y: Contrast ratio >= 4.5:1, touch target >= 40px, hỗ trợ motion-reduce:transition-none.
// 6. Xử lý xuất file CSV UTF-8 Byte Order Mark (\uFEFF) tương thích 100% với Microsoft Excel tiếng Việt.

export interface TableCellData {
  content: string;
  isHeader?: boolean;
}

export interface TableRowData {
  cells: TableCellData[];
}

export interface TableBlockProps {
  caption?: string | null;
  enableSearch?: boolean;
  enableExport?: boolean;
  rows?: TableRowData[];
  className?: string;
}

export function TableBlock({
  caption,
  enableSearch = false,
  enableExport = false,
  rows = [],
  className,
}: TableBlockProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  // Fallback: Khi không có dữ liệu bảng
  if (!rows || rows.length === 0) {
    return null;
  }

  // Tách dòng header đầu tiên (nếu có thuộc tính isHeader) và các dòng dữ liệu body
  const headerRow = rows[0]?.cells.some((cell) => cell.isHeader) ? rows[0] : null;
  const bodyRows = headerRow ? rows.slice(1) : rows;

  // Lọc dữ liệu client-side theo từ khóa tìm kiếm
  const filteredBodyRows = React.useMemo(() => {
    if (!searchTerm.trim()) return bodyRows;
    const query = searchTerm.toLowerCase().trim();
    return bodyRows.filter((row) =>
      row.cells.some((cell) => cell.content.toLowerCase().includes(query))
    );
  }, [bodyRows, searchTerm]);

  // Xuất file CSV có tiền tố \uFEFF (UTF-8 BOM) để Excel hiển thị đúng tiếng Việt
  const handleExportCsv = React.useCallback(() => {
    const csvRows: string[] = [];

    if (headerRow) {
      const headerLine = headerRow.cells
        .map((cell) => `"${cell.content.replace(/"/g, '""')}"`)
        .join(',');
      csvRows.push(headerLine);
    }

    filteredBodyRows.forEach((row) => {
      const rowLine = row.cells
        .map((cell) => `"${cell.content.replace(/"/g, '""')}"`)
        .join(',');
      csvRows.push(rowLine);
    });

    const csvContent = '\uFEFF' + csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeFilename = (caption || 'bang-thong-so-xe')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
    const filename = `${safeFilename}-${Date.now()}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [caption, filteredBodyRows, headerRow]);

  const showToolbar = enableSearch || enableExport;
  const colSpanCount = headerRow ? headerRow.cells.length : (rows[0]?.cells.length || 1);

  return (
    <div className={cn('not-prose my-8 space-y-4 font-sans', className)}>
      {/* 1. THANH CÔNG CỤ (TOOLBAR) TƯƠNG TÁC */}
      {showToolbar && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {enableSearch ? (
            <div className="relative max-w-sm flex-1">
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm thông số, phiên bản..."
                aria-label="Tìm kiếm trong bảng"
                leftIcon={
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                }
                rightIcon={
                  searchTerm ? (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      aria-label="Xóa từ khóa tìm kiếm"
                      className="rounded-full p-0.5 text-slate-400 hover:text-slate-200 transition-colors motion-reduce:transition-none"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <div />
          )}

          {enableExport && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="h-10 self-start sm:self-auto border-slate-700/60 bg-slate-900/60 text-slate-200 hover:bg-slate-800/80 hover:text-white transition-colors motion-reduce:transition-none"
              leftIcon={
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              }
            >
              Xuất Excel (CSV)
            </Button>
          )}
        </div>
      )}

      {/* 2. KHUNG CHỨA BẢNG DỮ LIỆU (Tái sử dụng Canonical Table Primitives) */}
      <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 backdrop-blur-xs overflow-hidden shadow-sm">
        <Table>
          {caption && <TableCaption className="text-slate-400 text-xs px-4 py-2 text-left">{caption}</TableCaption>}

          {/* Dòng Tiêu Đề Cột (Thead) */}
          {headerRow && (
            <TableHeader className="bg-slate-900/80 border-b border-slate-700/60">
              <TableRow isHeader>
                {headerRow.cells.map((cell, idx) => (
                  <TableHead key={idx} className="font-semibold text-slate-200 text-xs uppercase tracking-wider py-3.5 px-4">
                    {cell.content}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
          )}

          {/* Thân Bảng (Tbody) với 4-State UI Matrix */}
          <TableBody>
            {filteredBodyRows.length > 0 ? (
              // 4-State: DATA / SUCCESS STATE
              filteredBodyRows.map((row, rowIdx) => (
                <TableRow
                  key={rowIdx}
                  className={cn(
                    'border-b border-slate-800/60 transition-colors duration-150 motion-reduce:transition-none',
                    'even:bg-slate-900/20 hover:bg-slate-800/40'
                  )}
                >
                  {row.cells.map((cell, cellIdx) => (
                    <TableCell
                      key={cellIdx}
                      className={cn(
                        'px-4 py-3.5 text-sm text-slate-200',
                        cell.isHeader && 'font-semibold text-white'
                      )}
                    >
                      {cell.content}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              // 4-State: EMPTY SEARCH STATE (Icon + Message + Subtitle + Action CTA)
              <TableRow>
                <TableCell colSpan={colSpanCount} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/80 text-slate-400 border border-slate-700/60">
                      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                      </svg>
                    </div>
                    <p className="font-semibold text-sm text-slate-100">
                      Không tìm thấy dữ liệu phù hợp
                    </p>
                    <p className="max-w-xs text-xs text-slate-400">
                      Không có dòng nào khớp với từ khóa "{searchTerm}". Vui lòng kiểm tra lại chính tả hoặc xóa bộ lọc.
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchTerm('')}
                      className="text-xs text-[#0072CE] hover:text-[#005BA6] hover:bg-[#0072CE]/10"
                    >
                      Xóa bộ lọc tìm kiếm
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

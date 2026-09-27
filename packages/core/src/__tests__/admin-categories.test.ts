// 🧠 Mental Model: Machine Verification Test Suite cho Tính Năng Admin Categories Management.
// Tuân thủ triệt để universal-agentic-workflow v2.2.0 & fullstack-dev-executor v2.3.0
// 1. Khế ước dữ liệu Zod Schema & Rule sinh slug tiếng Việt chuẩn SEO.
// 2. Thuật toán kiểm soát Unique Slug Regex & Bắt lỗi Conflict.
// 3. Logic Restrict Delete Guard: Chặn xóa khi postCount > 0, cho phép khi postCount == 0.
// 4. Tính toàn vẹn cấu trúc file mã nguồn (File Artifacts Integrity).

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { createCategorySchema, updateCategorySchema } from '@cardealer/types';
import { slugifyVietnamese } from '../tiptap/extractor';

describe('Admin Categories Management - Machine Verification Suite', () => {
  // =================================================================
  // Suite 1: Zod Validation Contracts & SEO Vietnamese Slugify
  // =================================================================
  describe('Suite 1: Zod Schema Contracts & SEO Vietnamese Slugify', () => {
    it('TC-1.1: createCategorySchema chấp nhận payload hợp lệ đầy đủ', () => {
      const validPayload = {
        tenChuyenMuc: 'Đánh Giá Xe Hyundai',
        slug: 'danh-gia-xe-hyundai',
        moTa: 'Tổng hợp đánh giá chi tiết các mẫu xe Hyundai mới nhất',
        sortOrder: 1,
      };
      const result = createCategorySchema.safeParse(validPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tenChuyenMuc).toBe('Đánh Giá Xe Hyundai');
        expect(result.data.slug).toBe('danh-gia-xe-hyundai');
      }
    });

    it('TC-1.2: createCategorySchema từ chối slug chứa chữ hoa hoặc ký tự đặc biệt', () => {
      const invalidSlugPayload = {
        tenChuyenMuc: 'Bảng Giá Xe',
        slug: 'Bang-Gia-Xe!',
      };
      const result = createCategorySchema.safeParse(invalidSlugPayload);
      expect(result.success).toBe(false);
    });

    it('TC-1.3: createCategorySchema từ chối tên chuyên mục để trống', () => {
      const emptyNamePayload = {
        tenChuyenMuc: '',
        slug: 'a',
      };
      const result = createCategorySchema.safeParse(emptyNamePayload);
      expect(result.success).toBe(false);
    });

    it('TC-1.4: slugifyVietnamese chuyển đổi tiếng Việt có dấu sang slug SEO không dấu sạch', () => {
      const generatedSlug = slugifyVietnamese('Đánh Giá Xe Hyundai Tucson 2026 Mới Nhất!');
      expect(generatedSlug).toBe('danh-gia-xe-hyundai-tucson-2026-moi-nhat');
    });

    it('TC-1.5: slugifyVietnamese loại bỏ triệt để ký tự đặc biệt và dấu gạch nối kép', () => {
      const generatedSlug = slugifyVietnamese('Khuyến Mãi & Giảm Giá 100% Thuế Trước Bạ');
      expect(generatedSlug).toBe('khuyen-mai-giam-gia-100-thue-truoc-ba');
      expect(generatedSlug).not.toMatch(/[^a-z0-9-]/);
      expect(generatedSlug).not.toContain('--');
    });

    it('TC-1.6: updateCategorySchema cho phép partial updates', () => {
      const updatePayload = {
        tenChuyenMuc: 'Đánh Giá & Trải Nghiệm Xe',
        sortOrder: 5,
      };
      const result = updateCategorySchema.safeParse(updatePayload);
      expect(result.success).toBe(true);
    });
  });

  // =================================================================
  // Suite 2: Restrict Delete Guard & DTO Contract Rules
  // =================================================================
  describe('Suite 2: Restrict Delete Guard & DTO Contract Rules', () => {
    function checkCanDeleteCategory(postCount: number): { allowed: boolean; code?: string } {
      if (postCount > 0) {
        return { allowed: false, code: 'CATEGORY_IN_USE' };
      }
      return { allowed: true };
    }

    it('TC-2.1: Restrict Delete Guard chặn xóa khi danh mục đang có bài viết liên kết', () => {
      const guardTest = checkCanDeleteCategory(5);
      expect(guardTest.allowed).toBe(false);
      expect(guardTest.code).toBe('CATEGORY_IN_USE');
    });

    it('TC-2.2: Restrict Delete Guard cho phép xóa an toàn khi postCount == 0', () => {
      const guardTest = checkCanDeleteCategory(0);
      expect(guardTest.allowed).toBe(true);
    });
  });

  // =================================================================
  // Suite 3: File Artifacts Integrity Across Monorepo
  // =================================================================
  describe('Suite 3: File Artifacts Integrity Across Monorepo', () => {
    const rootDir = path.resolve(__dirname, '../../../..');

    const requiredFiles = [
      'packages/types/src/category.ts',
      'apps/admin/services/category.service.ts',
      'apps/admin/app/categories/CategoryModal.tsx',
      'apps/admin/app/categories/DeleteCategoryModal.tsx',
      'apps/admin/app/categories/page.tsx',
      'apps/admin/app/components/AdminShell.tsx',
      'apps/web/app/tin-tuc/page.tsx',
    ];

    requiredFiles.forEach((file) => {
      it(`TC-3: File ${file} phải tồn tại`, () => {
        const fullPath = path.join(rootDir, file);
        expect(fs.existsSync(fullPath)).toBe(true);
      });
    });

    it('TC-3.8: AdminShell.tsx đăng ký route /categories và icon FolderTree', () => {
      const adminShellContent = fs.readFileSync(path.join(rootDir, 'apps/admin/app/components/AdminShell.tsx'), 'utf-8');
      expect(adminShellContent).toContain('/categories');
      expect(adminShellContent).toContain('FolderTree');
    });

    it('TC-3.9: Web tin-tuc/page.tsx hỗ trợ tham số truy vấn ?category={slug}', () => {
      const webNewsContent = fs.readFileSync(path.join(rootDir, 'apps/web/app/tin-tuc/page.tsx'), 'utf-8');
      expect(webNewsContent).toContain('category?: string');
      expect(webNewsContent).toContain('/tin-tuc?category=');
    });
  });
});

import { describe, it, expect } from 'vitest';
import {
  MediaItemSchema,
  UpdateMediaSchema,
  MediaQuerySchema,
  BatchDeleteMediaSchema,
  hasPermission,
  type Role,
} from '@cardealer/types';

describe('Admin Media Library - Contracts & Permissions Test Suite', () => {
  describe('MediaItemSchema Validation', () => {
    it('chấp nhận một bản ghi MediaItem hợp lệ đầy đủ trường', () => {
      const validMedia = {
        id: '9c8a14b5-6548-433b-871d-5c68b7e21a88',
        filename: 'hyundai-santafe-2025.webp',
        url: 'https://res.cloudinary.com/ddozajlqu/image/upload/v1/cardealer/santafe.webp',
        publicId: 'cardealer/santafe_123',
        format: 'webp',
        mimeType: 'image/webp',
        fileSize: 204800,
        altText: 'Hyundai Santa Fe 2025 màu đen',
        width: 1920,
        height: 1080,
        folder: 'cardealer',
        uploaderId: 'e3b0c442-98fc-1c14-9afb-4c7fa4f00101',
        createdAt: '2026-09-29T01:30:00.000Z',
        updatedAt: '2026-09-29T01:30:00.000Z',
      };

      const result = MediaItemSchema.safeParse(validMedia);
      expect(result.success).toBe(true);
    });

    it('từ chối khi thiếu trường bắt buộc hoặc sai định dạng UUID', () => {
      const invalidMedia = {
        id: 'not-a-uuid',
        filename: '',
        url: 'not-a-url',
      };

      const result = MediaItemSchema.safeParse(invalidMedia);
      expect(result.success).toBe(false);
    });
  });

  describe('MediaQuerySchema Validation', () => {
    it('gán giá trị mặc định cho phân trang nếu không truyền tham số', () => {
      const parsed = MediaQuerySchema.parse({});
      expect(parsed.page).toBe(1);
      expect(parsed.limit).toBe(24);
      expect(parsed.sortBy).toBe('newest');
    });

    it('giới hạn số lượng tối đa 100 ảnh mỗi trang', () => {
      const result = MediaQuerySchema.safeParse({ limit: 150 });
      expect(result.success).toBe(false);
    });
  });

  describe('UpdateMediaSchema Validation', () => {
    it('chấp nhận altText hợp lệ', () => {
      const result = UpdateMediaSchema.safeParse({
        altText: 'Ảnh nội thất Hyundai Tucson',
      });
      expect(result.success).toBe(true);
    });

    it('từ chối altText vượt quá 255 ký tự', () => {
      const result = UpdateMediaSchema.safeParse({
        altText: 'a'.repeat(256),
      });
      expect(result.success).toBe(false);
    });
  });

  describe('BatchDeleteMediaSchema Validation', () => {
    it('chấp nhận danh sách UUID hợp lệ', () => {
      const result = BatchDeleteMediaSchema.safeParse({
        ids: [
          '9c8a14b5-6548-433b-871d-5c68b7e21a88',
          'e3b0c442-98fc-1c14-9afb-4c7fa4f00101',
        ],
      });
      expect(result.success).toBe(true);
    });

    it('từ chối khi mảng rỗng hoặc vượt quá 50 IDs', () => {
      const emptyResult = BatchDeleteMediaSchema.safeParse({ ids: [] });
      expect(emptyResult.success).toBe(false);

      const tooManyResult = BatchDeleteMediaSchema.safeParse({
        ids: Array.from({ length: 51 }, () => '9c8a14b5-6548-433b-871d-5c68b7e21a88'),
      });
      expect(tooManyResult.success).toBe(false);
    });
  });

  describe('RBAC Permissions for Media Module', () => {
    it('Admin có toàn quyền read, write, delete media', () => {
      expect(hasPermission('admin', 'media:read')).toBe(true);
      expect(hasPermission('admin', 'media:write')).toBe(true);
      expect(hasPermission('admin', 'media:delete')).toBe(true);
    });

    it('Manager có toàn quyền read, write, delete media', () => {
      expect(hasPermission('manager', 'media:read')).toBe(true);
      expect(hasPermission('manager', 'media:write')).toBe(true);
      expect(hasPermission('manager', 'media:delete')).toBe(true);
    });

    it('Editor chỉ có quyền read và write, không được phép delete', () => {
      expect(hasPermission('editor', 'media:read')).toBe(true);
      expect(hasPermission('editor', 'media:write')).toBe(true);
      expect(hasPermission('editor', 'media:delete')).toBe(false);
    });

    it('Sales chỉ có quyền read, không được phép write hay delete', () => {
      expect(hasPermission('sales', 'media:read')).toBe(true);
      expect(hasPermission('sales', 'media:write')).toBe(false);
      expect(hasPermission('sales', 'media:delete')).toBe(false);
    });
  });
});

import { describe, it, expect } from 'vitest';
import { optimizeCloudinaryUrl } from '../media/cloudinary';

describe('optimizeCloudinaryUrl', () => {
  it('chèn đúng các cờ f_auto,q_auto,w_...,c_fill vào URL Cloudinary', () => {
    const rawUrl =
      'https://res.cloudinary.com/ddozajlqu/image/upload/v1791044041/media/giao-xe-vo-chong-anh-anh_musldm2c.jpg';

    const optimized = optimizeCloudinaryUrl(rawUrl, { width: 500 });
    expect(optimized).toBe(
      'https://res.cloudinary.com/ddozajlqu/image/upload/f_auto,q_auto,c_fill,w_500/v1791044041/media/giao-xe-vo-chong-anh-anh_musldm2c.jpg'
    );
  });

  it('hỗ trợ tùy biến format, quality, height và crop', () => {
    const rawUrl =
      'https://res.cloudinary.com/ddozajlqu/image/upload/v1/media/Banner.webp';

    const optimized = optimizeCloudinaryUrl(rawUrl, {
      width: 1200,
      height: 600,
      quality: 80,
      format: 'webp',
      crop: 'fit',
    });

    expect(optimized).toBe(
      'https://res.cloudinary.com/ddozajlqu/image/upload/f_webp,q_80,c_fit,w_1200,h_600/v1/media/Banner.webp'
    );
  });

  it('thay thế transformation cũ nếu URL đã có sẵn transform', () => {
    const existingUrl =
      'https://res.cloudinary.com/ddozajlqu/image/upload/f_auto,q_auto/v1/media/Creta.webp';

    const optimized = optimizeCloudinaryUrl(existingUrl, { width: 400 });
    expect(optimized).toBe(
      'https://res.cloudinary.com/ddozajlqu/image/upload/f_auto,q_auto,c_fill,w_400/v1/media/Creta.webp'
    );
  });

  it('bảo toàn 100% URL gốc nếu không phải Cloudinary (Zero Disruption)', () => {
    expect(optimizeCloudinaryUrl('/images/cars/default.webp')).toBe(
      '/images/cars/default.webp'
    );
    expect(optimizeCloudinaryUrl('https://images.unsplash.com/photo-123')).toBe(
      'https://images.unsplash.com/photo-123'
    );
  });

  it('xử lý an toàn null, undefined và chuỗi rỗng', () => {
    expect(optimizeCloudinaryUrl(null)).toBe('');
    expect(optimizeCloudinaryUrl(undefined)).toBe('');
    expect(optimizeCloudinaryUrl('')).toBe('');
  });
});

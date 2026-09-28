import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { validateServerEnv } from '@cardealer/env';
import { Readable } from 'node:stream';

// 🧠 Mental Model: Dịch vụ Cloudinary Streaming Service & Quản trị Tệp Đám Mây (R2 & R15 Mitigation).
// 1. Áp dụng cơ chế Streaming Pipeline: Stream trực tiếp từ Incoming Request vào Cloudinary qua `upload_stream`,
//    triệt tiêu hoàn toàn rủi ro Memory Leak / OOM Crash (CWE-400) do không đọc toàn bộ file vào RAM Buffer.
// 2. Tự động chuyển đổi tối ưu định dạng hình ảnh WebP/AVIF và chất lượng tự động (`f_auto, q_auto`).
// 3. Cơ chế Compensating Rollback (R15): Cung cấp hàm `rollbackCloudinaryUpload` để xóa ngay file vừa upload
//    nếu việc ghi dữ liệu vào cơ sở dữ liệu PostgreSQL gặp lỗi.

const serverEnv = validateServerEnv();

// Khởi tạo cấu hình Cloudinary an toàn phía Server qua Single Source of Truth `serverEnv`
cloudinary.config({
  cloud_name: serverEnv.CLOUDINARY_CLOUD_NAME,
  api_key: serverEnv.CLOUDINARY_API_KEY,
  api_secret: serverEnv.CLOUDINARY_API_SECRET,
  secure: true,
});

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  mimeType: string;
}

export interface UploadStreamOptions {
  filename: string;
  folder?: string;
  mimeType: string;
}

/**
 * 🧠 Stream trực tiếp luồng dữ liệu nhị phân từ multipart stream lên Cloudinary
 */
export async function uploadStreamToCloudinary(
  stream: Readable,
  options: UploadStreamOptions
): Promise<CloudinaryUploadResult> {
  const folder = options.folder || serverEnv.CLOUDINARY_FOLDER;

  // Trích xuất tên tệp sạch (khử đuôi file để làm public_id_prefix)
  const cleanBaseName = options.filename
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 80);

  return new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        public_id: `${cleanBaseName}_${Date.now().toString(36)}`,
        overwrite: false,
        transformation: [
          { quality: 'auto:good' },
          { fetch_format: 'auto' },
        ],
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          console.error('❌ [Cloudinary Service] Upload Stream thất bại:', error?.message || 'Không có kết quả');
          return reject(new Error(error?.message || 'CLOUDINARY_STREAM_UPLOAD_FAILED'));
        }

        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
          format: result.format || 'webp',
          bytes: result.bytes,
          width: result.width,
          height: result.height,
          mimeType: options.mimeType || `image/${result.format || 'webp'}`,
        });
      }
    );

    // Bắt lỗi stream input
    stream.on('error', (streamErr) => {
      console.error('❌ [Cloudinary Service] Input Stream lỗi:', streamErr);
      reject(streamErr);
    });

    // Pipe dữ liệu vào Cloudinary upload stream
    stream.pipe(uploadStream);
  });
}

/**
 * 🧠 Xóa an toàn một tệp hình ảnh trên Cloudinary dựa trên public_id
 */
export async function deleteCloudinaryAsset(publicId: string): Promise<boolean> {
  try {
    const safePublicId = publicId.replace(/[\r\n]/g, '').trim();
    const result = await cloudinary.uploader.destroy(safePublicId, {
      resource_type: 'image',
      invalidate: true, // Xóa cache CDN
    });

    return result.result === 'ok' || result.result === 'not found';
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error(`⚠️ [Cloudinary Service] Lỗi khi xóa asset ${publicId}:`, msg);
    return false;
  }
}

/**
 * 🧠 Cơ chế Compensating Rollback (R15 Guard):
 * Tự động thu hồi ảnh vừa tải lên nếu giao dịch ghi vào PostgreSQL bị hủy hoặc sập kết nối.
 */
export async function rollbackCloudinaryUpload(publicId: string): Promise<void> {
  if (!publicId) return;
  console.warn(`🔄 [Cloudinary Rollback] Đang thu hồi asset do lỗi Database: ${publicId}`);
  await deleteCloudinaryAsset(publicId);
}

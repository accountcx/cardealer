import { v2 as cloudinary, ResourceApiResponse } from 'cloudinary';
import { sql } from 'drizzle-orm';
import { db, schema, queryClient } from '../client';
import type { NewMediaRow } from '../schema/media';

// 🧠 Mental Model: Script nạp dữ liệu hạt giống (Seed Data) đồng bộ hình ảnh từ Cloudinary về thư viện Media Library
// 1. Quét toàn bộ hình ảnh trong thư mục chỉ định (mặc định: 'media' hoặc từ biến môi trường CLOUDINARY_FOLDER).
// 2. Tự động phân trang (Pagination với next_cursor) quét sạch 100% hình ảnh không giới hạn số lượng.
// 3. Chuẩn hóa Metadata: Filename, Public ID, CDN Secure URL, Dimensions (width x height), File Size, Format, MIME type.
// 4. Tự động sinh Alt Text SEO thân thiện từ tên tệp nếu chưa có.
// 5. Thực thi chèn dữ liệu với cơ chế An toàn Idempotent: ON CONFLICT (public_id) DO NOTHING (không gây trùng lặp).

interface CloudinaryAsset {
  public_id: string;
  format: string;
  resource_type: string;
  bytes: number;
  width?: number;
  height?: number;
  secure_url: string;
  created_at?: string;
}

function cleanFilenameFromPublicId(publicId: string, format: string): string {
  const parts = publicId.split('/');
  const base = parts[parts.length - 1];
  if (base.toLowerCase().endsWith(`.${format.toLowerCase()}`)) {
    return base;
  }
  return `${base}.${format}`;
}

function generateAltText(filename: string): string {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  return nameWithoutExt
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export async function seedMediaFromCloudinary(targetFolder?: string) {
  const folder = targetFolder || process.env.CLOUDINARY_FOLDER || 'media';
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error('❌ [Seed Media] Thiếu cấu hình Cloudinary trong file .env!');
    console.error('   Yêu cầu: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
    process.exit(1);
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  console.log('========================================================================');
  console.log(`🚀 [SEED MEDIA] Bắt đầu đồng bộ ảnh từ Cloudinary folder: "${folder}"`);
  console.log(`   Cloud Name: ${cloudName}`);
  console.log('========================================================================');

  const allAssets: CloudinaryAsset[] = [];
  let nextCursor: string | undefined = undefined;
  let pageCount = 0;

  try {
    console.log(`📡 Đang kết nối Cloudinary Admin API để quét tài nguyên...`);

    do {
      pageCount++;
      const res: ResourceApiResponse = await cloudinary.api.resources({
        type: 'upload',
        prefix: folder,
        max_results: 500,
        next_cursor: nextCursor,
      });

      if (res.resources && res.resources.length > 0) {
        allAssets.push(...(res.resources as unknown as CloudinaryAsset[]));
        console.log(`  ✓ Trang ${pageCount}: Lấy được ${res.resources.length} ảnh (Tổng tích lũy: ${allAssets.length})`);
      }

      nextCursor = res.next_cursor;
    } while (nextCursor);

    console.log(`\n📦 Tìm thấy tổng cộng ${allAssets.length} hình ảnh trên Cloudinary folder "${folder}".`);

    if (allAssets.length === 0) {
      console.log('ℹ️ Không có hình ảnh nào trong thư mục này cần đồng bộ.');
      return;
    }

    // 2. Chuyển đổi sang định dạng NewMediaRow
    const mediaRows: NewMediaRow[] = allAssets.map((asset) => {
      const filename = cleanFilenameFromPublicId(asset.public_id, asset.format);
      const altText = generateAltText(filename);
      const mimeType = asset.resource_type === 'image' ? `image/${asset.format}` : 'application/octet-stream';

      return {
        filename,
        url: asset.secure_url,
        publicId: asset.public_id,
        format: asset.format.toLowerCase(),
        mimeType,
        fileSize: asset.bytes,
        altText,
        width: asset.width || null,
        height: asset.height || null,
        folder,
        createdAt: asset.created_at ? new Date(asset.created_at) : new Date(),
        updatedAt: new Date(),
      };
    });

    // 3. Chèn vào PostgreSQL theo batch 50 items
    console.log(`\n🗄️ Đang ghi nhận dữ liệu vào bảng media (PostgreSQL)...`);
    const BATCH_SIZE = 50;
    let insertedCount = 0;

    for (let i = 0; i < mediaRows.length; i += BATCH_SIZE) {
      const batch = mediaRows.slice(i, i + BATCH_SIZE);

      const result = await db
        .insert(schema.media)
        .values(batch)
        .onConflictDoNothing({ target: schema.media.publicId })
        .returning({ id: schema.media.id });

      insertedCount += result.length;
      console.log(`  ✓ Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(mediaRows.length / BATCH_SIZE)}: Đã xử lý ${batch.length} ảnh (+${result.length} mới).`);
    }

    const skippedCount = mediaRows.length - insertedCount;

    // 4. Lấy tổng số bản ghi hiện tại trong database
    const totalInDbRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.media);
    const totalInDb = Number(totalInDbRes[0]?.count || 0);

    console.log('\n========================================================================');
    console.log('🎉 ĐỒNG BỘ ẢNH TỪ CLOUDINARY HOÀN TẤT THÀNH CÔNG!');
    console.log('========================================================================');
    console.log(`  • Quét được từ Cloudinary: ${allAssets.length} ảnh`);
    console.log(`  • Thêm mới thành công:      ${insertedCount} ảnh`);
    console.log(`  • Bỏ qua (đã tồn tại sẵn): ${skippedCount} ảnh`);
    console.log(`  • Tổng số ảnh trong DB:     ${totalInDb} ảnh`);
    console.log('========================================================================\n');
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('❌ [Seed Media] Gặp lỗi trong quá trình đồng bộ:', errorMsg);
    throw error;
  }
}

// Thực thi nếu chạy trực tiếp qua CLI
const targetFolderArg = process.argv[2];
seedMediaFromCloudinary(targetFolderArg)
  .then(async () => {
    await queryClient.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('Fatal error:', err);
    await queryClient.end();
    process.exit(1);
  });

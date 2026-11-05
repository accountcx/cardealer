import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import crypto from 'crypto';

// 🧠 Mental Model: Webhook API phục vụ On-Demand Cache Invalidation cho Storefront.
// Cho phép Admin Portal hoặc CI bắn tín hiệu xóa cache tức thì khi có biến động giá xe hoặc bài viết.
// Bảo mật chặt: Chỉ xác thực qua HTTP Header x-revalidate-secret hoặc Authorization Bearer.
// Cấm tuyệt đối nhận token qua query parameter (F-004).
// Fail-Closed: Bắt buộc cấu hình biến môi trường REVALIDATE_SECRET trên server (F-001).
// So sánh token an toàn thời gian cố định bằng SHA-256 Digest + crypto.timingSafeEqual (F-008).
// Next.js 16 cache invalidation: revalidateTag với { expire: 0 } (F-009).
export async function POST(request: NextRequest) {
  const expectedSecret = process.env.REVALIDATE_SECRET;

  // Invariant 4 / F-001: Fail-Closed nếu REVALIDATE_SECRET chưa được cấu hình ở môi trường server
  if (!expectedSecret) {
    console.error('[Revalidate API] Server configuration error: REVALIDATE_SECRET is missing.');
    return NextResponse.json(
      { success: false, message: 'Server configuration error: REVALIDATE_SECRET is not configured.' },
      { status: 500 }
    );
  }

  // F-004: Chỉ nhận secret từ HTTP Header x-revalidate-secret hoặc Authorization Bearer (cấm query parameter)
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  const secret = request.headers.get('x-revalidate-secret') || bearerToken;

  if (!secret) {
    return NextResponse.json(
      { success: false, message: 'Invalid or missing revalidation secret token.' },
      { status: 401 }
    );
  }

  // F-008: Timing-safe comparison dùng SHA-256 digest để so sánh thời gian cố định, chống timing attack
  const secretHash = crypto.createHash('sha256').update(secret).digest();
  const expectedHash = crypto.createHash('sha256').update(expectedSecret).digest();

  if (!crypto.timingSafeEqual(secretHash, expectedHash)) {
    return NextResponse.json(
      { success: false, message: 'Invalid or missing revalidation secret token.' },
      { status: 401 }
    );
  }

  let body: { path?: string; tag?: string } = {};
  try {
    body = await request.json();
  } catch {
    body = {
      path: request.nextUrl.searchParams.get('path') || undefined,
      tag: request.nextUrl.searchParams.get('tag') || undefined,
    };
  }

  const { path, tag } = body;

  if (!path && !tag) {
    return NextResponse.json(
      { success: false, message: "At least one of 'path' or 'tag' must be provided for revalidation." },
      { status: 400 }
    );
  }

  try {
    if (path) {
      revalidatePath(path);
    }
    if (tag) {
      // F-009: Next.js 16 profile { expire: 0 } để xóa cache ngay lập tức thay vì retention dài
      revalidateTag(tag, { expire: 0 });
    }

    return NextResponse.json(
      {
        success: true,
        revalidated: true,
        path: path || null,
        tag: tag || null,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Revalidate API] Error purging cache:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to revalidate cache.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

// 🧠 Mental Model: Webhook API phục vụ On-Demand Cache Invalidation cho Storefront.
// Cho phép Admin Portal hoặc CI bắn tín hiệu xóa cache tức thì khi có biến động giá xe hoặc bài viết.
// Bảo mật kép: Xác thực qua Header x-revalidate-secret hoặc Query parameter ?secret=...
export async function POST(request: NextRequest) {
  const secret =
    request.headers.get('x-revalidate-secret') ||
    request.nextUrl.searchParams.get('secret');

  const expectedSecret =
    process.env.REVALIDATE_SECRET || 'hyundai-vinh-revalidate-secret-2026';

  if (!secret || secret !== expectedSecret) {
    return NextResponse.json(
      { success: false, message: 'Invalid or missing revalidation secret token.' },
      { status: 401 }
    );
  }

  let body: { path?: string; tag?: string } = {};
  try {
    body = await request.json();
  } catch {
    // Cho phép đọc query nếu body rỗng
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
      revalidateTag(tag, 'max');
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

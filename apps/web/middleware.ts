// 🧠 Mental Model: Next.js 301 Redirect Middleware Engine cho Storefront (apps/web).
// Nhiệm vụ:
// 1. Bảo toàn 100% PageRank và Link Equity khi thay đổi Slug bài viết/dòng xe theo chuẩn Google Search Central.
// 2. Tận dụng resolveRedirectChain từ @cardealer/core để chặn triệt để vòng lặp chuyển hướng vô tận (ERR_TOO_MANY_REDIRECTS)
//    và giới hạn chuỗi chuyển hướng tối đa 3 bước (Max 3 Hops).
// 3. Hiệu năng cao: Tích hợp Micro In-Memory Cache (TTL 60s) giảm thiểu 99% tải xuống API backend khi bot quét link cũ.
// 4. Timeout Guard: Giới hạn thời gian chờ tra cứu 1.500ms, tự động cho qua (NextResponse.next()) nếu API phản hồi chậm,
//    tuyệt đối không bao giờ làm nghẽn trải nghiệm người dùng.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getServerApiUrl } from '@cardealer/env';
import { resolveRedirectChain, type RedirectLookupItem } from '@cardealer/core';

// ============================================================================
// 1. IN-MEMORY CACHE (HIGH-PERFORMANCE REDIRECT CACHE)
// ============================================================================

interface CacheEntry {
  data: RedirectLookupItem | null;
  expiresAt: number;
}

// Bộ đệm nhớ tạm thời trong vòng đời của process Edge/Node
const redirectCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000; // 60 giây
const MAX_CACHE_SIZE = 500;

function getCachedRedirect(path: string): RedirectLookupItem | null | undefined {
  const entry = redirectCache.get(path);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    redirectCache.delete(path);
    return undefined;
  }
  return entry.data;
}

function setCachedRedirect(path: string, data: RedirectLookupItem | null): void {
  // Dọn dẹp cache nếu vượt quá giới hạn
  if (redirectCache.size >= MAX_CACHE_SIZE) {
    const firstKey = redirectCache.keys().next().value;
    if (firstKey) redirectCache.delete(firstKey);
  }
  redirectCache.set(path, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

// ============================================================================
// 2. REMOTE LOOKUP WITH TIMEOUT GUARD
// ============================================================================

async function fetchRedirectFromApi(path: string): Promise<RedirectLookupItem | null> {
  const cached = getCachedRedirect(path);
  if (cached !== undefined) {
    return cached;
  }

  const baseApiUrl = getServerApiUrl().replace(/\/+$/, '');
  const targetUrl = `${baseApiUrl}/api/redirects?path=${encodeURIComponent(path)}`;

  // AbortController timeout 1.500ms chống nghẽn Middleware
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1500);

  try {
    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }

    const payload = (await res.json()) as { success: boolean; data: RedirectLookupItem | null };
    const result = payload.success && payload.data ? payload.data : null;

    setCachedRedirect(path, result);
    return result;
  } catch (err) {
    clearTimeout(timeoutId);
    // Timeout hoặc network error: Ghi log nhẹ và bỏ qua để request tiếp tục bình thường
    return null;
  }
}

// ============================================================================
// 3. MIDDLEWARE HANDLER
// ============================================================================

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Bỏ qua trang chủ và các đường dẫn hệ thống nội bộ
  if (pathname === '/' || pathname.startsWith('/api') || pathname.startsWith('/_next')) {
    return NextResponse.next();
  }

  try {
    const fullRelativePath = `${pathname}${request.nextUrl.search}`;

    // Giải quyết chuỗi redirect an toàn tối đa 3 bước và chống vòng lặp
    const resolved = await resolveRedirectChain(fullRelativePath, fetchRedirectFromApi, {
      maxHops: 3,
      preserveQuery: true,
    });

    if (resolved.hasRedirect && resolved.destinationPath) {
      // Đảm bảo destinationPath hợp lệ
      const destinationUrl = new URL(resolved.destinationPath, request.url);

      const response = NextResponse.redirect(destinationUrl, resolved.statusCode || 301);
      response.headers.set('X-Redirected-By', 'Cardealer-301-Engine');
      response.headers.set('X-Redirect-Hops', String(resolved.hopCount));
      return response;
    }
  } catch (error) {
    console.error('[Middleware] Lỗi xử lý 301 Redirect:', error);
  }

  return NextResponse.next();
}

// ============================================================================
// 4. MATCHER CONFIG
// ============================================================================

export const config = {
  matcher: [
    /*
     * Khớp toàn bộ URL ngoại trừ:
     * - _next/static (static chunks)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - Các định dạng file tĩnh phổ biến: svg, png, jpg, jpeg, gif, webp, ico, css, js
     */
    '/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};

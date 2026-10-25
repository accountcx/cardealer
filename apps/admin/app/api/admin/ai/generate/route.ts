import { NextRequest, NextResponse } from 'next/server';
import { getServerApiUrl } from '@cardealer/env';

// 🧠 Mental Model: Specialized Route Handler cho AI Generation Proxy.
// Vấn đề: Next.js dev server rewrites có giới hạn proxy socket timeout cố định là 30s.
// Khi model AI sinh bài dài (1500-2500 từ) mất 30-45s, rewrites sẽ báo lỗi `socket hang up` (ECONNRESET).
// Giải pháp: Sử dụng App Router Route Handler với maxDuration=120s và native fetch để hỗ trợ các request kéo dài tới 2 phút.

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const backendBaseUrl = getServerApiUrl() || 'http://127.0.0.1:4000';
  const backendUrl = `${backendBaseUrl.replace(/\/+$/, '')}/api/admin/ai/generate`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    // Không chuyển tiếp header host để tránh xung đột routing phía backend
    if (key.toLowerCase() !== 'host') {
      headers.set(key, value);
    }
  });

  try {
    const body = await req.text();
    const startTime = Date.now();
    console.log('[Admin AI Route Handler] Chuyển tiếp request tới Backend:', backendUrl);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body,
      signal: AbortSignal.timeout(120_000),
    });

    const responseBody = await response.text();
    console.log(`[Admin AI Route Handler] Nhận kết quả từ Backend sau ${Date.now() - startTime}ms (Status: ${response.status})`);

    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (error: unknown) {
    console.error('[Admin AI Route Handler] ❌ Lỗi chuyển tiếp AI generate:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROXY_FORWARD_TIMEOUT',
          message: error instanceof Error ? error.message : 'Yêu cầu sinh AI bị gián đoạn hoặc quá thời gian chờ',
        },
      },
      { status: 504 }
    );
  }
}

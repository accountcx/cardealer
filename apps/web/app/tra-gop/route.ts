import { NextRequest, NextResponse } from 'next/server';

// 🧠 Mental Model: Redirect Route cho URL /tra-gop -> /gia-lan-banh?tab=tra-gop
// Đảm bảo bảo toàn đầy đủ các query params (?xe=...&phien-ban=...) sang bảng tính trả góp ngân hàng
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const newParams = new URLSearchParams(searchParams);
  newParams.set('tab', 'tra-gop');

  const destination = `/gia-lan-banh?${newParams.toString()}`;
  return NextResponse.redirect(new URL(destination, request.url), 307);
}

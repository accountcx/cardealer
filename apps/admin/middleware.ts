import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bỏ qua static files & internal Next.js assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('admin_token')?.value;

  // 1. Nếu đang ở trang login: nếu đã có token thì chuyển thẳng vào /cars
  if (pathname === '/login') {
    if (token) {
      return NextResponse.redirect(new URL('/cars', request.url));
    }
    return NextResponse.next();
  }

  // 2. Chuyển hướng trang chủ / sang /cars
  if (pathname === '/') {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.redirect(new URL('/cars', request.url));
  }

  // 3. Đối với tất cả các trang quản trị còn lại: kiểm tra token
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

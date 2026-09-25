// 🧠 Mental Model: Động cơ chuyển hướng 301 Redirect Resolver độc quyền @cardealer/core.
// Bảo toàn 100% PageRank và Link Equity theo chuẩn Google Search Central khi thay đổi Slug bài viết hoặc xe.
// Giải quyết triệt để 3 rủi ro kỹ thuật SEO cốt lõi:
// 1. Chống lỗi lặp chuyển hướng vô tận (ERR_TOO_MANY_REDIRECTS) bằng Cyclic Graph Detection (Visited Set).
// 2. Giới hạn độ sâu chuỗi chuyển hướng tối đa 3 bước (Max 3 Hops) tránh làm suy hao PageRank (Redirect Chain Degradation).
// 3. Chuẩn hóa đường dẫn Canonical: Tự động chuẩn hóa trailing slash, giải mã URL encode an toàn, bảo lưu query parameters (UTM tags).

// ============================================================================
// 1. INTERFACES & TYPES
// ============================================================================

export interface RedirectLookupItem {
  newPath: string;
  statusCode?: number;
}

export type RedirectLookupFn = (
  path: string
) => RedirectLookupItem | null | undefined | Promise<RedirectLookupItem | null | undefined>;

export interface ResolveRedirectOptions {
  /**
   * Giới hạn số bước chuyển hướng tối đa. Khuyến nghị chuẩn Google là 3.
   * @default 3
   */
  maxHops?: number;
  /**
   * Có giữ lại query parameters (UTM tags, ref, trang...) khi redirect hay không.
   * @default true
   */
  preserveQuery?: boolean;
}

export interface ResolvedRedirectResult {
  hasRedirect: boolean;
  destinationPath: string | null;
  statusCode: number;
  hopCount: number;
  isLoopDetected: boolean;
  pathChain: string[];
}

// ============================================================================
// 2. HELPER FUNCTIONS
// ============================================================================

/**
 * 🧠 Chuẩn hóa đường dẫn phục vụ tra cứu Redirect:
 * - Luôn bắt đầu bằng dấu gạch chéo `/`.
 * - Loại bỏ trailing slash ở cuối (ví dụ: `/tin-tuc/xe-moi/` -> `/tin-tuc/xe-moi`), trừ root `/`.
 * - Chuyển chữ hoa thành chữ thường cho phần pathname.
 */
export function normalizeRedirectPath(rawPath: string): string {
  if (!rawPath || typeof rawPath !== 'string') return '/';

  let cleaned = rawPath.trim();

  // Tách query string nếu có
  const queryIndex = cleaned.indexOf('?');
  let pathname = queryIndex !== -1 ? cleaned.slice(0, queryIndex) : cleaned;

  // Đảm bảo bắt đầu bằng /
  if (!pathname.startsWith('/')) {
    pathname = `/${pathname}`;
  }

  // Khử duplicate slashes liền nhau (e.g. //tin-tuc///bai-viet -> /tin-tuc/bai-viet)
  pathname = pathname.replace(/\/+/g, '/');

  // Loại bỏ trailing slash nếu độ dài > 1
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  // Chuyển về chữ thường để tra cứu không phân biệt hoa thường
  try {
    pathname = decodeURI(pathname).toLowerCase();
  } catch {
    pathname = pathname.toLowerCase();
  }

  return pathname;
}

/**
 * 🧠 Trích xuất Search Query Parameters từ URL hoặc Path
 */
export function extractQueryString(rawPath: string): string {
  if (!rawPath || typeof rawPath !== 'string') return '';
  const queryIndex = rawPath.indexOf('?');
  return queryIndex !== -1 ? rawPath.slice(queryIndex) : '';
}

// ============================================================================
// 3. CORE REDIRECT RESOLVER ENGINE
// ============================================================================

/**
 * 🧠 Mental Model: Thuật toán giải quyết chuỗi Redirect an toàn (Safe Redirect Chain Resolver).
 * - Tra cứu theo từng bước từ `lookupFn`.
 * - Sử dụng Set cấu trúc `visitedPaths` phát hiện chu trình lặp (Cyclic Detection).
 * - Dừng ngay lập tức khi phát hiện lặp hoặc vượt quá `maxHops` (mặc định 3).
 * - Ghép nối lại query parameters nguyên bản nếu `preserveQuery: true`.
 */
export async function resolveRedirectChain(
  rawPath: string,
  lookupFn: RedirectLookupFn,
  options: ResolveRedirectOptions = {}
): Promise<ResolvedRedirectResult> {
  const maxHops = options.maxHops ?? 3;
  const preserveQuery = options.preserveQuery ?? true;

  const initialNormalizedPath = normalizeRedirectPath(rawPath);
  const originalQuery = extractQueryString(rawPath);

  let currentPath = initialNormalizedPath;
  let finalStatusCode = 301;
  let hopCount = 0;
  let isLoopDetected = false;

  const visitedPaths = new Set<string>([currentPath]);
  const pathChain: string[] = [currentPath];

  while (hopCount < maxHops) {
    const lookupResult = await lookupFn(currentPath);

    // Không tìm thấy quy tắc chuyển hướng tiếp theo -> Kết thúc chuỗi
    if (!lookupResult || !lookupResult.newPath) {
      break;
    }

    const nextNormalizedPath = normalizeRedirectPath(lookupResult.newPath);
    finalStatusCode = lookupResult.statusCode ?? 301;

    // Phát hiện vòng lặp vô tận (Direct self-redirect hoặc Cyclic Loop)
    if (nextNormalizedPath === currentPath || visitedPaths.has(nextNormalizedPath)) {
      isLoopDetected = true;
      pathChain.push(nextNormalizedPath);
      break;
    }

    visitedPaths.add(nextNormalizedPath);
    pathChain.push(nextNormalizedPath);
    currentPath = nextNormalizedPath;
    hopCount++;
  }

  const hasRedirect = hopCount > 0 && !isLoopDetected;

  let destinationPath: string | null = null;
  if (hasRedirect) {
    destinationPath = currentPath;
    // Bảo lưu query parameters nếu có
    if (preserveQuery && originalQuery) {
      const separator = destinationPath.includes('?') ? '&' : '?';
      destinationPath = `${destinationPath}${separator}${originalQuery.replace(/^\?/, '')}`;
    }
  }

  return {
    hasRedirect,
    destinationPath,
    statusCode: finalStatusCode,
    hopCount,
    isLoopDetected,
    pathChain,
  };
}

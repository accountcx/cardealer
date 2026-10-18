import { clientEnv, getServerApiUrl } from '@cardealer/env';

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: unknown;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(message: string, code = 'UNKNOWN_ERROR', statusCode = 500, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

// 🧠 Mental Model: Centralized HTTP Client cho Admin CMS (apps/admin).
// 1. Client-side (trình duyệt): Gọi qua relative URL (/api/...) để đi qua Next.js Rewrites trên cùng domain (cms.xehyundaivinh.com),
//    đảm bảo HttpOnly cookie `admin_token` được gắn trực tiếp vào domain CMS (tương thích 100% với Next.js Middleware) và không dính CORS.
// 2. Server-side (SSR): Tự động phân giải qua getServerApiUrl() (http://127.0.0.1:4000).
class HttpClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    // Chuẩn hóa baseUrl: loại bỏ trailing slash
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  private resolveBaseUrl(): string {
    if (typeof window !== 'undefined') {
      return '';
    }
    return getServerApiUrl() || this.baseUrl;
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const base = this.resolveBaseUrl();

    if (!base) {
      if (!params || Object.keys(params).length === 0) {
        return cleanEndpoint;
      }
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const qs = searchParams.toString();
      return qs ? `${cleanEndpoint}?${qs}` : cleanEndpoint;
    }

    // Khử trùng lặp tiền tố /api nếu baseUrl đã có /api và endpoint cũng truyền /api
    if (base.endsWith('/api') && cleanEndpoint.startsWith('/api/')) {
      cleanEndpoint = cleanEndpoint.replace(/^\/api/, '');
    }

    const url = new URL(`${base}${cleanEndpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private handleUnauthorized(): void {
    if (typeof window !== 'undefined') {
      // 🧠 Gọi API logout để xóa HttpOnly cookie từ response header của server,
      // triệt tiêu vòng lặp chuyển hướng giữa Client và Next.js Server Middleware (M-01)
      try {
        fetch(this.buildUrl('/api/auth/logout'), {
          method: 'POST',
          credentials: 'include',
        }).catch(() => {});
      } catch {
        // Ignored
      }
      document.cookie = 'admin_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
    }
  }

  public async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { body, params, headers, ...restOptions } = options;
    const url = this.buildUrl(endpoint, params);

    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

    const requestHeaders: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(headers as Record<string, string>),
    };

    let response: Response;
    try {
      response = await fetch(url, {
        ...restOptions,
        headers: requestHeaders,
        credentials: 'include',
        body: isFormData
          ? (body as FormData)
          : body !== undefined
            ? JSON.stringify(body)
            : undefined,
      });
    } catch (networkError) {
      throw new AppError(
        'Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.',
        'NETWORK_DISCONNECTED',
        0,
        networkError
      );
    }

    // Global 401 Interceptor: Hết hạn phiên / chưa đăng nhập
    if (response.status === 401) {
      this.handleUnauthorized();
    }

    let json: ApiSuccessResponse<T> | ApiErrorResponse;
    try {
      json = await response.json();
    } catch {
      if (!response.ok) {
        throw new AppError(`Lỗi máy chủ (${response.status})`, 'SERVER_ERROR', response.status);
      }
      return {} as T;
    }

    if (!response.ok || !json.success) {
      const errorData = (json as ApiErrorResponse).error;
      throw new AppError(
        errorData?.message || 'Yêu cầu không thành công',
        errorData?.code || 'API_ERROR',
        response.status,
        errorData?.details
      );
    }

    return json.data;
  }

  public get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET', params });
  }

  public post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  public put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  public delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new HttpClient(clientEnv.NEXT_PUBLIC_API_URL);

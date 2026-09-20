import { clientEnv } from '@cardealer/env';

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

// 🧠 Mental Model: Centralized HTTP Client bọc quanh fetch với baseURL từ clientEnv, credentials và Interceptor bắt lỗi 401 toàn cục
class HttpClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    // Chuẩn hóa baseUrl: loại bỏ trailing slash
    this.baseUrl = baseUrl.replace(/\/+$/, '');
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    // Khử trùng lặp tiền tố /api nếu baseUrl đã có /api và endpoint cũng truyền /api
    if (this.baseUrl.endsWith('/api') && cleanEndpoint.startsWith('/api/')) {
      cleanEndpoint = cleanEndpoint.replace(/^\/api/, '');
    }

    const url = new URL(`${this.baseUrl}${cleanEndpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  public async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { body, params, headers, ...restOptions } = options;
    const url = this.buildUrl(endpoint, params);

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(headers as Record<string, string>),
    };

    let response: Response;
    try {
      response = await fetch(url, {
        ...restOptions,
        headers: requestHeaders,
        credentials: 'include',
        body: body !== undefined ? JSON.stringify(body) : undefined,
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
      if (typeof window !== 'undefined') {
        // 🧠 Xóa cookie token để chống vòng lặp chuyển hướng giữa Client và Next.js Server Middleware
        document.cookie = 'admin_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        }
      }
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

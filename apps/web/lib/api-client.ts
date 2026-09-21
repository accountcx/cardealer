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

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: Record<string, string | number | boolean | undefined>;
}

// 🧠 Mental Model: Centralized HTTP Client cho Storefront (apps/web).
// 1. Client-side (trình duyệt): Gọi qua relative URL để tận dụng Next.js Rewrites, tự động loại bỏ lỗi CORS.
// 2. Server-side (SSR / ISR): Kết hợp process.env.INTERNAL_API_URL hoặc NEXT_PUBLIC_API_URL để fetch an toàn.
// 3. Chuẩn hóa trích xuất lỗi thành AppError và bóc tách dữ liệu payload tự động.
export class HttpClient {
  private readonly baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ? baseUrl.replace(/\/+$/, '') : '';
  }

  private resolveBaseUrl(): string {
    if (typeof window !== 'undefined') {
      return '';
    }
    if (this.baseUrl) return this.baseUrl;
    return (
      process.env.INTERNAL_API_URL ||
      clientEnv.NEXT_PUBLIC_API_URL ||
      'http://localhost:4000'
    ).replace(/\/+$/, '');
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
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

    let urlPath = cleanEndpoint;
    if (base.endsWith('/api') && cleanEndpoint.startsWith('/api/')) {
      urlPath = cleanEndpoint.replace(/^\/api/, '');
    }

    const url = new URL(`${base}${urlPath}`);
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
      Accept: 'application/json',
      ...(headers as Record<string, string>),
    };

    let response: Response;
    try {
      response = await fetch(url, {
        ...restOptions,
        headers: requestHeaders,
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

    let json: any;
    try {
      json = await response.json();
    } catch {
      if (!response.ok) {
        throw new AppError(`Lỗi máy chủ (${response.status})`, 'SERVER_ERROR', response.status);
      }
      return {} as T;
    }

    if (!response.ok || json?.success === false) {
      const errorObj = json?.error;
      const message =
        errorObj?.message ||
        (typeof errorObj === 'string' ? errorObj : null) ||
        (typeof json?.message === 'string' ? json.message : null) ||
        'Yêu cầu không thành công';
      const code = errorObj?.code || 'API_ERROR';
      throw new AppError(message, code, response.status, errorObj?.details);
    }

    return (json?.data !== undefined ? json.data : json) as T;
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

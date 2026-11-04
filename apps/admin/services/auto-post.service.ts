import { apiClient } from '../lib/api-client';
import type {
  AutoPostSettings,
  UpdateAutoPostSettingsInput,
  ContentPlanItem,
  CreateContentPlanItemInput,
  UpdateContentPlanItemInput,
  AutoPostLog,
  GenerateEditorialPlanRequest,
  EditorialPlanItem,
  IngestPlanRequest,
  SyncQueueInput,
} from '@cardealer/types';

export interface GetPlansResponse {
  data: ContentPlanItem[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface GetLogsResponse {
  data: AutoPostLog[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface RunNowResponse {
  postId: string;
  title: string;
  slug: string;
  status: string;
  executionTimeMs: number;
}

export const autoPostService = {
  // 1. Cấu hình Scheduler
  getSettings: async (): Promise<AutoPostSettings> => {
    return apiClient.get<AutoPostSettings>('/api/admin/auto-posts/settings');
  },

  updateSettings: async (input: UpdateAutoPostSettingsInput): Promise<AutoPostSettings> => {
    return apiClient.put<AutoPostSettings>('/api/admin/auto-posts/settings', input);
  },

  // 2. Hàng đợi kế hoạch bài viết
  getPlans: async (params?: { page?: number; limit?: number; status?: string }): Promise<GetPlansResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.status && params.status !== 'all') searchParams.set('status', params.status);

    const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const res = await apiClient.get<any>(`/api/admin/auto-posts/plans${queryStr}`);

    if (Array.isArray(res)) {
      return {
        data: res,
        pagination: {
          page: params?.page || 1,
          limit: params?.limit || 15,
          totalItems: res.length,
          totalPages: 1,
        },
      };
    }

    if (res && Array.isArray(res.items)) {
      return {
        data: res.items,
        pagination: res.pagination || {
          page: params?.page || 1,
          limit: params?.limit || 15,
          totalItems: res.items.length,
          totalPages: 1,
        },
      };
    }

    if (res && Array.isArray(res.data)) {
      return {
        data: res.data,
        pagination: res.pagination || {
          page: params?.page || 1,
          limit: params?.limit || 15,
          totalItems: res.data.length,
          totalPages: 1,
        },
      };
    }

    return {
      data: [],
      pagination: { page: 1, limit: 15, totalItems: 0, totalPages: 1 },
    };
  },

  createPlan: async (input: CreateContentPlanItemInput): Promise<ContentPlanItem> => {
    return apiClient.post<ContentPlanItem>('/api/admin/auto-posts/plans', input);
  },

  updatePlan: async (id: string, input: UpdateContentPlanItemInput): Promise<ContentPlanItem> => {
    return apiClient.patch<ContentPlanItem>(`/api/admin/auto-posts/plans/${id}`, input);
  },

  deletePlan: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete<{ success: boolean; message: string }>(`/api/admin/auto-posts/plans/${id}`);
  },

  // 3. AI Editorial Planner
  generateEditorialPlan: async (
    input: GenerateEditorialPlanRequest
  ): Promise<{ planItems: EditorialPlanItem[]; deduplicationCount: number }> => {
    return apiClient.post<{ planItems: EditorialPlanItem[]; deduplicationCount: number }>(
      '/api/admin/auto-posts/generate-plan',
      input
    );
  },

  ingestPlan: async (input: IngestPlanRequest): Promise<{ success: boolean; count: number; message: string }> => {
    return apiClient.post<{ success: boolean; count: number; message: string }>(
      '/api/admin/auto-posts/ingest-plan',
      input
    );
  },

  // 4. Kích hoạt Chạy Ngay
  runNow: async (): Promise<RunNowResponse> => {
    return apiClient.post<RunNowResponse>('/api/admin/auto-posts/run-now', {});
  },

  // 5. Nhật ký thực thi
  getLogs: async (params?: { page?: number; limit?: number }): Promise<GetLogsResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));

    const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const res = await apiClient.get<any>(`/api/admin/auto-posts/logs${queryStr}`);

    if (Array.isArray(res)) {
      return {
        data: res,
        pagination: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          totalItems: res.length,
          totalPages: 1,
        },
      };
    }

    if (res && Array.isArray(res.items)) {
      return {
        data: res.items,
        pagination: res.pagination || {
          page: params?.page || 1,
          limit: params?.limit || 10,
          totalItems: res.items.length,
          totalPages: 1,
        },
      };
    }

    if (res && Array.isArray(res.data)) {
      return {
        data: res.data,
        pagination: res.pagination || {
          page: params?.page || 1,
          limit: params?.limit || 10,
          totalItems: res.data.length,
          totalPages: 1,
        },
      };
    }

    return {
      data: [],
      pagination: { page: 1, limit: 10, totalItems: 0, totalPages: 1 },
    };
  },

  // 6. Đồng bộ giờ đăng cho hàng đợi
  syncQueue: async (input?: SyncQueueInput): Promise<{ updatedCount: number; message?: string }> => {
    return apiClient.post<{ updatedCount: number; message?: string }>(
      '/api/admin/auto-posts/sync-queue',
      input || {}
    );
  },
};

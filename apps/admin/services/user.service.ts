// 🧠 Mental Model: Typed Service Layer cho Quản trị Người dùng & Hồ sơ Cá nhân (Invariant 12)
// Toàn bộ giao tiếp qua apiClient tập trung, sử dụng Zod DTOs từ @cardealer/types
import { apiClient } from '../lib/api-client';
import type {
  UserResponse,
  CreateUserInput,
  UpdateUserInput,
  UserStatus,
  Role,
  UpdateProfileInput,
  ChangePasswordInput,
  AuditLogResponse,
} from '@cardealer/types';

export interface UserListResponse {
  data: UserResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuditLogListResponse {
  data: AuditLogResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const userService = {
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  }): Promise<UserResponse[]> => {
    return apiClient.get<UserResponse[]>('/api/admin/users', params);
  },

  getUserById: async (id: string): Promise<UserResponse> => {
    return apiClient.get<UserResponse>(`/api/admin/users/${id}`);
  },

  createUser: async (data: CreateUserInput): Promise<UserResponse> => {
    return apiClient.post<UserResponse>('/api/admin/users', data);
  },

  updateUser: async (id: string, data: UpdateUserInput): Promise<UserResponse> => {
    return apiClient.put<UserResponse>(`/api/admin/users/${id}`, data);
  },

  updateUserStatus: async (id: string, status: UserStatus): Promise<UserResponse> => {
    return apiClient.request<UserResponse>(`/api/admin/users/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
  },

  updateUserRole: async (id: string, role: Role): Promise<UserResponse> => {
    return apiClient.request<UserResponse>(`/api/admin/users/${id}/role`, {
      method: 'PATCH',
      body: { role },
    });
  },

  forceLogoutUser: async (id: string): Promise<{ id: string; tokenVersion: number }> => {
    return apiClient.post<{ id: string; tokenVersion: number }>(`/api/admin/users/${id}/force-logout`);
  },

  deleteUser: async (id: string): Promise<{ success: boolean; id: string }> => {
    return apiClient.delete<{ success: boolean; id: string }>(`/api/admin/users/${id}`);
  },

  getProfile: async (): Promise<UserResponse> => {
    return apiClient.get<UserResponse>('/api/admin/profile');
  },

  updateProfile: async (data: UpdateProfileInput): Promise<UserResponse> => {
    return apiClient.put<UserResponse>('/api/admin/profile', data);
  },

  changePassword: async (data: ChangePasswordInput): Promise<{ success: boolean; message: string; token?: string }> => {
    return apiClient.post<{ success: boolean; message: string; token?: string }>(
      '/api/admin/profile/change-password',
      data
    );
  },

  getAuditLogs: async (params?: { page?: number; limit?: number }): Promise<AuditLogResponse[]> => {
    return apiClient.get<AuditLogResponse[]>('/api/admin/audit-logs', params);
  },
};

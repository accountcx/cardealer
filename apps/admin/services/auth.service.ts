import { apiClient } from '../lib/api-client';
import { User, LoginInput } from '@cardealer/types';

export type AuthUser = User;

export interface LoginResult {
  user: User;
  token: string;
}

// 🧠 Mental Model: Service quản lý xác thực Admin, gọi qua Centralized API Client và trả về Typed DTO
export const authService = {
  login: async (credentials: LoginInput): Promise<LoginResult> => {
    return apiClient.post<LoginResult>('/api/auth/login', credentials);
  },

  getProfile: async (): Promise<{ user: User }> => {
    return apiClient.get<{ user: User }>('/api/auth/me');
  },

  logout: async (): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/api/auth/logout');
  },
};

import { apiClient } from '@puff/api';
import type { User } from '@puff/types';

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    return apiClient.get<DashboardStats>('/dashboard/stats');
  },
};

export interface UserListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

export interface UserListResponse {
  list: User[];
  total: number;
}

export const userApi = {
  getUsers: async (params: UserListParams): Promise<UserListResponse> => {
    return apiClient.get<UserListResponse>('/users', { params });
  },

  getUserById: async (id: string): Promise<User> => {
    return apiClient.get<User>(`/users/${id}`);
  },

  createUser: async (data: Partial<User>): Promise<User> => {
    return apiClient.post<User>('/users', data);
  },

  updateUser: async (id: string, data: Partial<User>): Promise<User> => {
    return apiClient.put<User>(`/users/${id}`, data);
  },

  deleteUser: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/users/${id}`);
  },
};

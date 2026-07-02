import type { User, ApiResponse } from '@puff/types';

const BASE_URL = process.env.API_BASE_URL || 'https://api.example.com';

export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = BASE_URL) {
    this.baseURL = baseURL;
  }

  async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async getUser(id: string): Promise<User> {
    const result = await this.request<User>(`/users/${id}`);
    return result.data;
  }
}

export const apiClient = new ApiClient();

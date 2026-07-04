import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import type { User, ApiResponse } from '@puff/types';

const BASE_URL = process.env.API_BASE_URL || 'https://api.example.com';

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export class ApiClient {
  private axiosInstance: AxiosInstance;
  private tokenStorage: {
    getToken: () => string | null;
    setToken: (token: string) => void;
    removeToken: () => void;
  };

  constructor(baseURL: string = BASE_URL) {
    this.axiosInstance = axios.create({
      baseURL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.tokenStorage = {
      getToken: () => {
        if (typeof window !== 'undefined') {
          return localStorage.getItem('access_token');
        }
        return null;
      },
      setToken: (token: string) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('access_token', token);
        }
      },
      removeToken: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
        }
      },
    };

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.tokenStorage.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.tokenStorage.removeToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token: string) {
    this.tokenStorage.setToken(token);
  }

  clearAuthToken() {
    this.tokenStorage.removeToken();
  }

  async request<T>(endpoint: string, options?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.axiosInstance.request<ApiResponse<T>>({
      url: endpoint,
      ...options,
    });
    return response.data;
  }

  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.request<T>(endpoint, { ...config, method: 'GET' });
    return response.data;
  }

  async post<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.request<T>(endpoint, { ...config, method: 'POST', data });
    return response.data;
  }

  async put<T>(endpoint: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.request<T>(endpoint, { ...config, method: 'PUT', data });
    return response.data;
  }

  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.request<T>(endpoint, { ...config, method: 'DELETE' });
    return response.data;
  }

  async getUser(id: string): Promise<User> {
    return this.get<User>(`/users/${id}`);
  }

  async login(username: string, password: string): Promise<AuthTokens> {
    const response = await this.post<AuthTokens>('/auth/login', { username, password });
    if (response.accessToken) {
      this.setAuthToken(response.accessToken);
    }
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.post('/auth/logout');
    } finally {
      this.clearAuthToken();
    }
  }

  async getCurrentUser(): Promise<User> {
    return this.get<User>('/auth/me');
  }
}

export const apiClient = new ApiClient();

import React, { createContext, useState, useCallback, useEffect } from 'react';
import type { AuthContextValue, User, AuthState } from '../types/permission';

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  updateUser: () => {},
});

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: User | null;
}

export function AuthProvider({ children, initialUser = null }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: initialUser,
    isAuthenticated: !!initialUser,
    isLoading: false,
  });

  // 模拟从 localStorage 或 API 加载用户信息
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          // TODO: 实际项目中应该调用 API 验证 token 并获取用户信息
          // const user = await fetchUserInfo(token);
          // setState({ user, isAuthenticated: true, isLoading: false });

          // 临时使用 mock 数据
          const mockUser: User = {
            id: '1',
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'admin' as any,
          };
          setState({ user: mockUser, isAuthenticated: true, isLoading: false });
        } else {
          setState({ user: null, isAuthenticated: false, isLoading: false });
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    };

    loadUser();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      // TODO: 实际项目中应该调用登录 API
      // const { token, user } = await loginAPI(email, password);
      // localStorage.setItem('auth_token', token);

      // 临时使用 mock 数据
      const mockUser: User = {
        id: '1',
        email,
        name: 'Admin User',
        role: 'admin' as any,
      };

      localStorage.setItem('auth_token', 'mock_token');
      setState({ user: mockUser, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      // TODO: 实际项目中应该调用登出 API
      // await logoutAPI();

      localStorage.removeItem('auth_token');
      setState({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }, []);

  const updateUser = useCallback((updatedUser: Partial<User>) => {
    setState((prev) => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...updatedUser } : null,
    }));
  }, []);

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

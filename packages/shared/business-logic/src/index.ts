import { apiClient } from '@puff/api';
import type { User } from '@puff/types';

export const useAuth = () => {
  const login = async (_username: string, _password: string): Promise<User> => {
    // 实现登录逻辑
    const user = await apiClient.getUser('1');
    return user;
  };

  const logout = () => {
    // 实现登出逻辑
    console.log('User logged out');
  };

  return { login, logout };
};

export const validateActivity = (startTime: string, endTime: string): boolean => {
  console.log('validateActivity!!');

  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);
  return now >= start && now <= end;
};

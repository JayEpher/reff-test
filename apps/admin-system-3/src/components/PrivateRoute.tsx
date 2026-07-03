import React from 'react';
import { Spin } from 'antd';
import { history } from 'umi';
import { useAuth } from '@/providers/AuthProvider';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ paddingTop: 100, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    history.push('/login');
    return null;
  }

  return <>{children}</>;
};

export default PrivateRoute;

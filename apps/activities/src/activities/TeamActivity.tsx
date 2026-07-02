import React from 'react';
import { useWebViewActivity } from '@/shared';

export const TeamActivity: React.FC = () => {
  const { isReady } = useWebViewActivity();

  if (!isReady) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ padding: '20px', minHeight: '100vh', background: '#f5f5f5' }}>
      <h1>👥 团队活动</h1>
      <p>团队活动页面开发中...</p>
    </div>
  );
};

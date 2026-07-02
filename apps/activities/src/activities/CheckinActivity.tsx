import React from 'react';
import { useWebViewActivity, closeWebView } from '@/shared';
import './CheckinActivity.css';

export const CheckinActivity: React.FC = () => {
  const { isReady } = useWebViewActivity();

  const handleCheckin = () => {
    // 处理签到逻辑
    console.log('Checkin button clicked');

    // 完成后可以关闭 WebView
    // closeWebView();
  };

  if (!isReady) {
    return <div>Loading...</div>;
  }

  return (
    <div className="checkin-container">
      <h1>每日签到</h1>
      <div className="checkin-content">
        <p>连续签到可获得更多奖励！</p>
        <button onClick={handleCheckin} className="checkin-button">
          立即签到
        </button>
      </div>
    </div>
  );
};

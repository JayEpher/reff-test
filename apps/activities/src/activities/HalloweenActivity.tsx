import React, { useState } from 'react';
import { useWebViewActivity, closeWebView, postMessageToRN } from '@/shared';
import { Button } from '@puff/ui';
import './HalloweenActivity.css';

export const HalloweenActivity: React.FC = () => {
  const { isReady } = useWebViewActivity();
  const [score, setScore] = useState(0);

  const handleJoinEvent = () => {
    // 发送事件到 RN
    postMessageToRN({
      type: 'JOIN_EVENT',
      payload: { eventName: 'halloween', timestamp: Date.now() },
    });

    alert('Trick or Treat!');
    setScore(score + 10);
  };

  const handleComplete = () => {
    // 通知 RN 活动完成
    postMessageToRN({
      type: 'EVENT_COMPLETE',
      payload: { score },
    });

    // 关闭 WebView
    closeWebView();
  };

  if (!isReady) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="halloween-container">
      <h1 className="halloween-title">🎃 Halloween Activity</h1>
      <p className="halloween-text">Welcome to the spooky Halloween event!</p>

      <div className="score-board">
        <p>Score: {score}</p>
      </div>

      <div className="button-group">
        <Button onClick={handleJoinEvent}>Join Event222</Button>
        {score > 0 && <Button onClick={handleComplete}>Complete</Button>}
      </div>
    </div>
  );
};

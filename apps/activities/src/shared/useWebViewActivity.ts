import { useEffect, useState } from 'react';
import { onMessageFromRN, notifyPageReady, type WebViewMessage } from './webview-bridge';

/**
 * 用于 WebView 活动页面的 Hook
 */
export const useWebViewActivity = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 页面加载完成后通知 RN
    notifyPageReady();
    setIsReady(true);

    // 监听来自 RN 的消息
    const unsubscribe = onMessageFromRN((message: WebViewMessage) => {
      console.log('Received message from RN:', message);
      // 可以在这里处理全局消息
    });

    return unsubscribe;
  }, []);

  return { isReady };
};

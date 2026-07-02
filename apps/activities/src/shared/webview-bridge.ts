// 共享的 WebView 通信工具
export interface WebViewMessage {
  type: string;
  payload?: any;
}

/**
 * 向 React Native 发送消息
 */
export const postMessageToRN = (message: WebViewMessage) => {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
  } else {
    console.warn('ReactNativeWebView not available');
  }
};

/**
 * 监听来自 React Native 的消息
 */
export const onMessageFromRN = (callback: (message: WebViewMessage) => void) => {
  const handler = (event: MessageEvent) => {
    try {
      const message = JSON.parse(event.data);
      callback(message);
    } catch (error) {
      console.error('Failed to parse message from RN:', error);
    }
  };

  window.addEventListener('message', handler);
  document.addEventListener('message', handler as any);

  return () => {
    window.removeEventListener('message', handler);
    document.removeEventListener('message', handler as any);
  };
};

/**
 * 通知 RN 页面加载完成
 */
export const notifyPageReady = () => {
  postMessageToRN({ type: 'PAGE_READY' });
};

/**
 * 通知 RN 关闭 WebView
 */
export const closeWebView = () => {
  postMessageToRN({ type: 'CLOSE_WEBVIEW' });
};

/**
 * 通知 RN 跳转到其他页面
 */
export const navigateToRN = (routeName: string, params?: any) => {
  postMessageToRN({
    type: 'NAVIGATE',
    payload: { routeName, params },
  });
};

// 扩展 Window 类型
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

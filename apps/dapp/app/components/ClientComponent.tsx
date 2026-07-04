'use client';

// 客户端组件 - 在浏览器中渲染
// 可以使用 React hooks、浏览器 API、事件处理等

import { useState, useEffect } from 'react';

export default function ClientComponent() {
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
        <span className="text-green-600 dark:text-green-400">🌐</span>
        客户端组件
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        此组件在浏览器中渲染，可以使用交互功能
      </p>
      <div className="bg-white dark:bg-gray-800 p-2 rounded text-xs mb-2">
        <p><strong>是否已挂载:</strong> {mounted ? '是' : '否'}</p>
        <p><strong>计数器:</strong> {count}</p>
      </div>
      <button
        onClick={() => setCount(count + 1)}
        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
      >
        点击增加
      </button>
    </div>
  );
}

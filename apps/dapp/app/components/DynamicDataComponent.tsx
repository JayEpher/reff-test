'use client';

// 动态数据获取组件
// 在客户端异步加载数据

import { useState, useEffect } from 'react';

type ApiData = {
  id: number;
  title: string;
};

export default function DynamicDataComponent() {
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/posts/1')
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="border border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
        <span className="text-yellow-600 dark:text-yellow-400">⚡</span>
        动态数据组件
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        此组件在客户端动态获取数据
      </p>
      <div className="bg-white dark:bg-gray-800 p-2 rounded text-xs">
        {loading ? (
          <p className="text-gray-500">加载中...</p>
        ) : data ? (
          <>
            <p><strong>ID:</strong> {data.id}</p>
            <p><strong>标题:</strong> {data.title}</p>
          </>
        ) : (
          <p className="text-red-500">加载失败</p>
        )}
      </div>
    </div>
  );
}

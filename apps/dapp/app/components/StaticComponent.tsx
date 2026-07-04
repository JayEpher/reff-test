// 静态组件 - 构建时生成
// 适合不经常变化的内容

type StaticData = {
  buildTime: string;
  version: string;
};

async function getStaticData(): Promise<StaticData> {
  return {
    buildTime: new Date().toISOString(),
    version: '1.0.0',
  };
}

export default async function StaticComponent() {
  const data = await getStaticData();

  return (
    <div className="border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
        <span className="text-purple-600 dark:text-purple-400">📦</span>
        静态组件
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        此组件在构建时生成，内容固定不变
      </p>
      <div className="bg-white dark:bg-gray-800 p-2 rounded text-xs">
        <p><strong>构建时间:</strong> {data.buildTime}</p>
        <p><strong>版本:</strong> {data.version}</p>
      </div>
    </div>
  );
}

// 强制静态生成
export const dynamic = 'force-static';

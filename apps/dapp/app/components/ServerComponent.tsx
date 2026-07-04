// 服务端组件 - 默认在服务器上渲染
// 可以直接访问数据库、文件系统等服务端资源

type ServerData = {
  timestamp: string;
  serverInfo: string;
};

async function getServerData(): Promise<ServerData> {
  // 模拟服务端数据获取
  return {
    timestamp: new Date().toISOString(),
    serverInfo: 'This data was fetched on the server',
  };
}

export default async function ServerComponent() {
  const data = await getServerData();

  return (
    <div className="border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
        <span className="text-blue-600 dark:text-blue-400">🖥️</span>
        服务端组件
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
        此组件在服务器上渲染，可以直接访问服务端资源
      </p>
      <div className="bg-white dark:bg-gray-800 p-2 rounded text-xs">
        <p><strong>服务器时间:</strong> {data.timestamp}</p>
        <p><strong>信息:</strong> {data.serverInfo}</p>
      </div>
    </div>
  );
}

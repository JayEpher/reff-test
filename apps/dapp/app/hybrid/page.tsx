// 混合渲染策略页面
// 在同一页面中组合不同的渲染策略

import ServerComponent from '../components/ServerComponent';
import ClientComponent from '../components/ClientComponent';
import StaticComponent from '../components/StaticComponent';
import DynamicDataComponent from '../components/DynamicDataComponent';

export default function HybridPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">混合渲染策略</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          在同一个页面中组合使用不同的渲染策略
        </p>

        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg mb-8">
          <h2 className="text-2xl font-semibold mb-4">为什么使用混合策略？</h2>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            <li className="flex gap-2">
              <span>✅</span>
              <span><strong>性能优化：</strong>静态内容快速加载，动态内容按需获取</span>
            </li>
            <li className="flex gap-2">
              <span>✅</span>
              <span><strong>用户体验：</strong>重要内容首屏渲染，次要内容延迟加载</span>
            </li>
            <li className="flex gap-2">
              <span>✅</span>
              <span><strong>灵活性：</strong>根据每个组件的特性选择最佳渲染方式</span>
            </li>
            <li className="flex gap-2">
              <span>✅</span>
              <span><strong>SEO友好：</strong>服务端组件确保内容可被搜索引擎索引</span>
            </li>
          </ul>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* 服务端组件 - 每次请求时在服务器渲染 */}
          <ServerComponent />

          {/* 客户端组件 - 在浏览器中渲染和交互 */}
          <ClientComponent />

          {/* 静态组件 - 构建时生成 */}
          <StaticComponent />

          {/* 动态数据组件 - 客户端获取数据 */}
          <DynamicDataComponent />
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">组件级渲染策略说明</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">🖥️ 服务端组件</h3>
              <ul className="text-sm space-y-1 list-disc list-inside text-gray-600 dark:text-gray-400">
                <li>默认行为，无需 &apos;use client&apos; 指令</li>
                <li>可以直接访问数据库、文件系统、环境变量</li>
                <li>减少客户端 JavaScript 包大小</li>
                <li>不能使用 useState、useEffect 等 hooks</li>
                <li>不能使用浏览器 API（如 localStorage）</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-green-600 dark:text-green-400 mb-2">🌐 客户端组件</h3>
              <ul className="text-sm space-y-1 list-disc list-inside text-gray-600 dark:text-gray-400">
                <li>使用 &apos;use client&apos; 指令声明</li>
                <li>可以使用所有 React hooks（useState、useEffect 等）</li>
                <li>可以处理用户交互（点击、输入等）</li>
                <li>可以访问浏览器 API</li>
                <li>组件代码会打包到客户端 JavaScript 中</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">📦 静态组件</h3>
              <ul className="text-sm space-y-1 list-disc list-inside text-gray-600 dark:text-gray-400">
                <li>使用 export const dynamic = &apos;force-static&apos;</li>
                <li>在构建时生成，内容固定</li>
                <li>适合不经常变化的内容（页脚、关于页面等）</li>
                <li>最快的加载速度</li>
                <li>可以缓存到 CDN</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2">⚡ 动态数据组件</h3>
              <ul className="text-sm space-y-1 list-disc list-inside text-gray-600 dark:text-gray-400">
                <li>客户端组件，使用 useEffect 获取数据</li>
                <li>显示加载状态，提升用户体验</li>
                <li>适合非关键数据（推荐、个性化内容）</li>
                <li>不影响首屏加载时间</li>
                <li>可以实现懒加载和无限滚动</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg">
            <h3 className="font-semibold mb-2">💡 最佳实践</h3>
            <ul className="text-sm space-y-1 list-disc list-inside text-gray-700 dark:text-gray-300">
              <li>默认使用服务端组件，只在需要交互时使用客户端组件</li>
              <li>将客户端组件推到组件树的叶子节点</li>
              <li>使用 Suspense 包裹异步服务端组件</li>
              <li>关键数据在服务端获取，非关键数据在客户端获取</li>
              <li>合理使用缓存策略（no-store、revalidate）</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

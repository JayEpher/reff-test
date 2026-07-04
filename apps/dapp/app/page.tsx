import Link from 'next/link';

export default function Home() {
  const renderingStrategies = [
    {
      name: 'Server-Side Rendering (SSR)',
      path: '/ssr',
      description: 'Rendered on the server for each request',
      color: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800',
    },
    {
      name: 'Incremental Static Regeneration (ISR)',
      path: '/isr',
      description: 'Static with periodic revalidation (60s)',
      color: 'bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 border-green-200 dark:border-green-800',
    },
    {
      name: 'Static Site Generation (SSG)',
      path: '/ssg',
      description: 'Fully static, generated at build time',
      color: 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 border-purple-200 dark:border-purple-800',
    },
    {
      name: 'Client-Side Rendering (CSR)',
      path: '/csr',
      description: 'Rendered in the browser with React',
      color: 'bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800',
    },
    {
      name: 'Hybrid Rendering (混合渲染)',
      path: '/hybrid',
      description: 'Mix different strategies in one page',
      color: 'bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800',
    },
  ];

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            Welcome to Puff DApp
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Next.js 15.0.4 Rendering Strategies Demo
          </p>
        </header>

        <main>
          <h2 className="text-3xl font-semibold mb-6 text-center">
            Explore Different Rendering Strategies
          </h2>

          <div className="grid gap-6 md:grid-cols-2 mb-12">
            {renderingStrategies.map((strategy) => (
              <Link
                key={strategy.path}
                href={strategy.path}
                className={`block p-6 rounded-lg border-2 transition-all transform hover:scale-105 ${strategy.color}`}
              >
                <h3 className="text-2xl font-semibold mb-2">{strategy.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{strategy.description}</p>
              </Link>
            ))}
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
            <h3 className="text-2xl font-semibold mb-4">About This Demo</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This application demonstrates four different rendering strategies available in Next.js 15:
            </p>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li className="flex gap-2">
                <span className="font-semibold min-w-[60px]">SSR:</span>
                <span>Best for dynamic, personalized content that changes frequently</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold min-w-[60px]">ISR:</span>
                <span>Perfect for content that updates periodically but doesn&apos;t need real-time data</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold min-w-[60px]">SSG:</span>
                <span>Ideal for static content like documentation, blogs, or marketing pages</span>
              </li>
              <li className="flex gap-2">
                <span className="font-semibold min-w-[60px]">CSR:</span>
                <span>Great for highly interactive dashboards and applications</span>
              </li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}

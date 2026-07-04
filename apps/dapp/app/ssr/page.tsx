// Server-Side Rendering (SSR)
// This page is rendered on each request on the server

type Post = {
  id: number;
  title: string;
  body: string;
};

async function getPosts(): Promise<Post[]> {
  const res = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5', {
    cache: 'no-store', // Disable caching to ensure fresh data on each request
  });

  if (!res.ok) {
    throw new Error('Failed to fetch posts');
  }

  return res.json();
}

export default async function SSRPage() {
  const posts = await getPosts();
  const timestamp = new Date().toISOString();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Server-Side Rendering (SSR)</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          This page is rendered on the server for each request
        </p>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
          <p className="text-sm">
            <strong>Rendered at:</strong> {timestamp}
          </p>
          <p className="text-sm mt-2">
            Refresh the page to see the timestamp update - this proves the page is re-rendered on each request.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Latest Posts</h2>
          {posts.map((post) => (
            <div key={post.id} className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
              <h3 className="text-xl font-medium mb-2">{post.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{post.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold mb-2">About SSR:</h3>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Data is fetched on every request</li>
            <li>Always shows the latest data</li>
            <li>Good for frequently changing content</li>
            <li>Slower TTFB (Time To First Byte) compared to static pages</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

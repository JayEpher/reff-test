// Static Site Generation (SSG)
// This page is fully static and generated at build time

type Album = {
  id: number;
  title: string;
  userId: number;
};

async function getAlbums(): Promise<Album[]> {
  const res = await fetch('https://jsonplaceholder.typicode.com/albums?_limit=10');

  if (!res.ok) {
    throw new Error('Failed to fetch albums');
  }

  return res.json();
}

export default async function SSGPage() {
  const albums = await getAlbums();
  const buildTime = new Date().toISOString();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Static Site Generation (SSG)</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          This page is fully static and generated at build time
        </p>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg mb-6">
          <p className="text-sm">
            <strong>Built at:</strong> {buildTime}
          </p>
          <p className="text-sm mt-2">
            This timestamp represents when the page was built. It will never change unless you rebuild the app.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Albums Collection</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {albums.map((album) => (
              <div key={album.id} className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-1">Album #{album.id}</p>
                    <h3 className="text-lg font-medium">{album.title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold mb-2">About SSG:</h3>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Page is generated at build time</li>
            <li>Fastest possible page load</li>
            <li>Can be served from CDN</li>
            <li>Perfect for content that doesn&apos;t change often</li>
            <li>No server-side processing on request</li>
            <li>Great for SEO</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Force static generation
export const dynamic = 'force-static';

// Incremental Static Regeneration (ISR)
// This page is statically generated and revalidated every 60 seconds

type User = {
  id: number;
  name: string;
  email: string;
  company: {
    name: string;
  };
};

async function getUsers(): Promise<User[]> {
  const res = await fetch('https://jsonplaceholder.typicode.com/users', {
    next: { revalidate: 60 }, // Revalidate every 60 seconds
  });

  if (!res.ok) {
    throw new Error('Failed to fetch users');
  }

  return res.json();
}

export default async function ISRPage() {
  const users = await getUsers();
  const timestamp = new Date().toISOString();

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Incremental Static Regeneration (ISR)</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          This page is statically generated and revalidated every 60 seconds
        </p>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg mb-6">
          <p className="text-sm">
            <strong>Page generated at:</strong> {timestamp}
          </p>
          <p className="text-sm mt-2">
            This timestamp will stay the same for 60 seconds, then update on the next request after that period.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Users Directory</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {users.map((user) => (
              <div key={user.id} className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-1">{user.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user.email}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">{user.company.name}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold mb-2">About ISR:</h3>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Page is statically generated at build time</li>
            <li>Revalidated in the background after specified time (60s here)</li>
            <li>Fast response times (served from cache)</li>
            <li>Balances static performance with dynamic content</li>
            <li>Perfect for content that updates periodically</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

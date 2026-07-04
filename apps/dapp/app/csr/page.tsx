'use client';

// Client-Side Rendering (CSR)
// This page is rendered entirely on the client side

import { useState, useEffect } from 'react';

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

export default function CSRPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientTime, setClientTime] = useState<string>('');

  useEffect(() => {
    // Set client render time
    setClientTime(new Date().toISOString());

    // Fetch data on the client side
    fetch('https://jsonplaceholder.typicode.com/todos?_limit=10')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch todos');
        return res.json();
      })
      .then((data) => {
        setTodos(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const toggleTodo = (id: number) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Client-Side Rendering (CSR)</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          This page is rendered entirely on the client side using React hooks
        </p>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg mb-6">
          <p className="text-sm">
            <strong>Client rendered at:</strong> {clientTime || 'Rendering...'}
          </p>
          <p className="text-sm mt-2">
            The data is fetched after the page loads in the browser. You&apos;ll see a loading state first.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Todo List (Interactive)</h2>

          {loading && (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg">
              Error: {error}
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-2">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => toggleTodo(todo.id)}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => {}}
                      className="w-5 h-5 cursor-pointer"
                    />
                    <span
                      className={`flex-1 ${
                        todo.completed
                          ? 'line-through text-gray-400 dark:text-gray-600'
                          : ''
                      }`}
                    >
                      {todo.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="font-semibold mb-2">About CSR:</h3>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Page shell is sent to the client first</li>
            <li>Data is fetched on the client side using JavaScript</li>
            <li>Requires JavaScript to be enabled</li>
            <li>Better for highly interactive UIs</li>
            <li>Not ideal for SEO (content not in initial HTML)</li>
            <li>Can show loading states during data fetching</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

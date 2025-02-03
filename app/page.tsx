'use client';

import { useState, useEffect } from 'react';

interface Task {
  id: string;
  keyword: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks from Notion on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  // Fetch tasks from Notion where `generate` column is empty
  const fetchTasks = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/fetchTasks');
      if (!res.ok) throw new Error(`Failed to fetch tasks`);
      
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  // Generate content for a specific task
  const generateContent = async (id: string, keyword: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generateContent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, keyword }),
      });

      if (!res.ok) throw new Error(`Failed to generate content`);

      fetchTasks(); // Refresh task list after update
    } catch (error) {
      console.error('Error generating content:', error);
      setError('Failed to generate content.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-xl p-3">Automated Content Generator</h1>

      {loading && <p className="text-gray-600">Processing...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {tasks.length > 0 ? (
        <ul className="w-full max-w-2xl">
          {tasks.map((task) => (
            <li key={task.id} className="mb-4 p-4 border rounded-md bg-gray-50">
              <h2 className="font-medium">{task.keyword}</h2>
              <button
                onClick={() => generateContent(task.id, task.keyword)}
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Generate Content
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No tasks found.</p>
      )}
    </div>
  );
}

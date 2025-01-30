'use client';

import { useState, FormEvent } from 'react';

export default function Home() {
  const [input, setInput] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false); // New loading state

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true); // Set loading to true when fetching starts

    try {
      const res = await fetch('http://localhost:3001/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: input }),
      });

      if (!res.ok) {
        const errorMessage = await res.text();
        console.error('Error fetching response:', errorMessage);
        throw new Error(`HTTP error! Status: ${res.status}, Message: ${errorMessage}`);
      }

      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      console.error('Error fetching response:', error);
      setResponse('Failed to fetch response. Please check the server and try again.');
    } finally {
      setLoading(false); // Set loading to false when fetching is complete
    }
  };

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen py-2 mb-2 p-1">
      <h1 className="text-xl p-3">Chat with DeepSeek (Offline Mode)</h1>
      <form onSubmit={handleSubmit} className="flex flex-row gap-5 mb-3">
        <input
          className="border border-gray-300 rounded-md p-2 text-[#1c1c1c] gap-3"
          type="text"
          size={60}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your prompt"
        />
        <button className="bg-orange-300 p-2 border rounded-md text-[#1c1c1c]" type="submit">
          Send
        </button>
      </form>

      {/* Display loading indicator when fetching data */}
      {loading && (
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 border-4 border-t-4 border-gray-300 border-dotted rounded-full animate-spin"></div>
          <span className="text-lg text-gray-600">Fetching response...</span>
        </div>
      )}

      {response && !loading && (
        <div className="flex flex-col gap-3 text-justify text-lg w-full max-w-xl">
          <h2 className="font-medium text-md">Response</h2>
          <div className="bg-gray-100 p-4 rounded-lg shadow-md">
            <p className="text-base text-[#1c1c1c]">{response}</p>
          </div>
        </div>
      )}
    </div>
  );
}

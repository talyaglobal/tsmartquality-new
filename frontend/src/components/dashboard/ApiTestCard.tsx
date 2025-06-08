'use client';

import { useState } from 'react';

export default function ApiTestCard() {
  const [frontendResult, setFrontendResult] = useState<any>(null);
  const [backendResult, setBackendResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testFrontendApi = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/test');
      const data = await response.json();
      setFrontendResult(data);
    } catch (err: any) {
      console.error('Frontend API test error:', err);
      setError(err.message || 'Failed to test frontend API');
    } finally {
      setIsLoading(false);
    }
  };

  const testBackendApi = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // This assumes the backend API is running on localhost:3000/api
      // In a real deployment, this would use the environment variable
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/health`);
      const data = await response.json();
      setBackendResult(data);
    } catch (err: any) {
      console.error('Backend API test error:', err);
      setError(err.message || 'Failed to test backend API');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <div className="p-6">
        <h3 className="text-base font-medium text-gray-900">API Integration Test</h3>
        <p className="mt-1 text-sm text-gray-500">
          Test the connection between frontend and backend APIs.
        </p>

        <div className="mt-4 flex space-x-4">
          <button
            onClick={testFrontendApi}
            disabled={isLoading}
            className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:bg-primary-400"
          >
            Test Frontend API
          </button>
          <button
            onClick={testBackendApi}
            disabled={isLoading}
            className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:bg-primary-400"
          >
            Test Backend API
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {frontendResult && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900">Frontend API Response:</h4>
            <pre className="mt-2 rounded-md bg-gray-100 p-4 text-xs overflow-auto">
              {JSON.stringify(frontendResult, null, 2)}
            </pre>
          </div>
        )}

        {backendResult && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900">Backend API Response:</h4>
            <pre className="mt-2 rounded-md bg-gray-100 p-4 text-xs overflow-auto">
              {JSON.stringify(backendResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
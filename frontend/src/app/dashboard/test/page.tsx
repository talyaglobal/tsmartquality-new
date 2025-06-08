'use client';

import ApiTestCard from '@/components/dashboard/ApiTestCard';

export default function TestPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">API Integration Tests</h1>
      <p className="mt-2 text-gray-600">
        Use this page to test the connection between the frontend and backend APIs.
      </p>
      
      <div className="mt-6">
        <ApiTestCard />
      </div>
    </div>
  );
}
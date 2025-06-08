'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';

interface QualityCheck {
  id: string;
  product: {
    id: string;
    name: string;
    stock_code: string;
  };
  inspector: {
    id: string;
    name: string;
  };
  check_date: string;
  status: 'pending' | 'passed' | 'failed';
  notes: string;
  created_at: string;
}

interface QualityChecksTableProps {
  qualityChecks: QualityCheck[];
  isLoading: boolean;
}

export default function QualityChecksTable({ qualityChecks, isLoading }: QualityChecksTableProps) {
  const [sortField, setSortField] = useState<keyof QualityCheck>('check_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof QualityCheck) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedChecks = [...qualityChecks].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    // Handle nested objects
    if (sortField === 'product') {
      aValue = a.product.name;
      bValue = b.product.name;
    } else if (sortField === 'inspector') {
      aValue = a.inspector.name;
      bValue = b.inspector.name;
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (isLoading) {
    return (
      <div className="mt-6 flow-root">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (qualityChecks.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No quality checks</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new quality check.</p>
        <div className="mt-6">
          <Link
            href="/dashboard/quality-checks/new"
            className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            <svg
              className="-ml-0.5 mr-1.5 h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
            New Quality Check
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 cursor-pointer"
                    onClick={() => handleSort('check_date')}
                  >
                    <div className="flex items-center">
                      Date
                      <span className="ml-1 flex-none rounded bg-gray-200 text-gray-900 group-hover:bg-gray-300">
                        {sortField === 'check_date' && (
                          <span>
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </span>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                    onClick={() => handleSort('product')}
                  >
                    <div className="flex items-center">
                      Product
                      <span className="ml-1 flex-none rounded bg-gray-200 text-gray-900 group-hover:bg-gray-300">
                        {sortField === 'product' && (
                          <span>
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </span>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                    onClick={() => handleSort('inspector')}
                  >
                    <div className="flex items-center">
                      Inspector
                      <span className="ml-1 flex-none rounded bg-gray-200 text-gray-900 group-hover:bg-gray-300">
                        {sortField === 'inspector' && (
                          <span>
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </span>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      <span className="ml-1 flex-none rounded bg-gray-200 text-gray-900 group-hover:bg-gray-300">
                        {sortField === 'status' && (
                          <span>
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </span>
                    </div>
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {sortedChecks.map((check) => (
                  <tr key={check.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {new Date(check.check_date).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div className="font-medium text-gray-900">{check.product.name}</div>
                      <div className="text-gray-500">{check.product.stock_code}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {check.inspector.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusBadgeClass(
                          check.status
                        )}`}
                      >
                        {check.status.charAt(0).toUpperCase() + check.status.slice(1)}
                      </span>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <Link
                        href={`/dashboard/quality-checks/${check.id}`}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        View
                      </Link>
                      <Link
                        href={`/dashboard/quality-checks/${check.id}/edit`}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        Edit
                      </Link>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => window.confirm('Are you sure you want to delete this quality check?')}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
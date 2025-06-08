'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import QualityChecksTable from '@/components/quality-checks/QualityChecksTable';
import QualityChecksFilter, { QualityCheckFilters } from '@/components/quality-checks/QualityChecksFilter';
import { qualityChecksAPI } from '@/lib/api';

// Sample data for products and inspectors
const MOCK_PRODUCTS = [
  { id: 'p1', name: 'Product A', stock_code: 'P001' },
  { id: 'p2', name: 'Product B', stock_code: 'P002' },
  { id: 'p3', name: 'Product C', stock_code: 'P003' },
  { id: 'p4', name: 'Product D', stock_code: 'P004' },
  { id: 'p5', name: 'Product E', stock_code: 'P005' },
];

const MOCK_INSPECTORS = [
  { id: 'i1', name: 'John Doe' },
  { id: 'i2', name: 'Jane Smith' },
  { id: 'i3', name: 'Robert Johnson' },
];

// Sample quality checks data
const MOCK_QUALITY_CHECKS = [
  {
    id: 'qc1',
    product: { id: 'p1', name: 'Product A', stock_code: 'P001' },
    inspector: { id: 'i1', name: 'John Doe' },
    check_date: '2023-06-01T00:00:00Z',
    status: 'passed' as const,
    notes: 'All specifications met',
    created_at: '2023-06-01T10:30:00Z',
  },
  {
    id: 'qc2',
    product: { id: 'p2', name: 'Product B', stock_code: 'P002' },
    inspector: { id: 'i2', name: 'Jane Smith' },
    check_date: '2023-06-02T00:00:00Z',
    status: 'failed' as const,
    notes: 'Color not matching specification',
    created_at: '2023-06-02T14:15:00Z',
  },
  {
    id: 'qc3',
    product: { id: 'p3', name: 'Product C', stock_code: 'P003' },
    inspector: { id: 'i3', name: 'Robert Johnson' },
    check_date: '2023-06-03T00:00:00Z',
    status: 'pending' as const,
    notes: 'Waiting for sample analysis',
    created_at: '2023-06-03T09:45:00Z',
  },
  {
    id: 'qc4',
    product: { id: 'p4', name: 'Product D', stock_code: 'P004' },
    inspector: { id: 'i1', name: 'John Doe' },
    check_date: '2023-06-04T00:00:00Z',
    status: 'passed' as const,
    notes: 'All specifications met',
    created_at: '2023-06-04T11:20:00Z',
  },
  {
    id: 'qc5',
    product: { id: 'p5', name: 'Product E', stock_code: 'P005' },
    inspector: { id: 'i2', name: 'Jane Smith' },
    check_date: '2023-06-05T00:00:00Z',
    status: 'failed' as const,
    notes: 'Weight out of tolerance',
    created_at: '2023-06-05T16:10:00Z',
  },
];

export default function QualityChecksPage() {
  const [qualityChecks, setQualityChecks] = useState(MOCK_QUALITY_CHECKS);
  const [filteredChecks, setFilteredChecks] = useState(MOCK_QUALITY_CHECKS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In a real application, we would fetch the quality checks from the API
  useEffect(() => {
    const fetchQualityChecks = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Comment out for now since we're using mock data
        // const data = await qualityChecksAPI.getAll();
        // setQualityChecks(data.qualityChecks);
        // setFilteredChecks(data.qualityChecks);
        
        // Using mock data
        setQualityChecks(MOCK_QUALITY_CHECKS);
        setFilteredChecks(MOCK_QUALITY_CHECKS);
      } catch (err: any) {
        console.error('Failed to fetch quality checks:', err);
        setError(err.message || 'Failed to fetch quality checks');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQualityChecks();
  }, []);

  const handleFilterChange = (filters: QualityCheckFilters) => {
    const filtered = qualityChecks.filter((check) => {
      // Product filter
      if (filters.productId && check.product.id !== filters.productId) {
        return false;
      }

      // Inspector filter
      if (filters.inspectorId && check.inspector.id !== filters.inspectorId) {
        return false;
      }

      // Status filter
      if (filters.status && check.status !== filters.status) {
        return false;
      }

      // Date range filter
      const checkDate = new Date(check.check_date);
      
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        if (checkDate < fromDate) {
          return false;
        }
      }
      
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        if (checkDate > toDate) {
          return false;
        }
      }

      return true;
    });

    setFilteredChecks(filtered);
  };

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Quality Checks</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all quality checks including product, inspector, date, and status.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/dashboard/quality-checks/new"
            className="block rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            New Quality Check
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <QualityChecksFilter
          products={MOCK_PRODUCTS}
          inspectors={MOCK_INSPECTORS}
          onFilterChange={handleFilterChange}
        />
      </div>

      {error && (
        <div className="mt-6 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <QualityChecksTable qualityChecks={filteredChecks} isLoading={isLoading} />
    </div>
  );
}
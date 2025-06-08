'use client';

import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  stock_code: string;
}

interface Inspector {
  id: string;
  name: string;
}

interface QualityChecksFilterProps {
  products: Product[];
  inspectors: Inspector[];
  onFilterChange: (filters: QualityCheckFilters) => void;
}

export interface QualityCheckFilters {
  productId: string;
  inspectorId: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

export default function QualityChecksFilter({
  products,
  inspectors,
  onFilterChange,
}: QualityChecksFilterProps) {
  const [filters, setFilters] = useState<QualityCheckFilters>({
    productId: '',
    inspectorId: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      productId: '',
      inspectorId: '',
      status: '',
      dateFrom: '',
      dateTo: '',
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold leading-6 text-gray-900">Filter Quality Checks</h3>
        <div className="mt-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-5">
          <div>
            <label htmlFor="productId" className="block text-sm font-medium text-gray-700">
              Product
            </label>
            <div className="mt-1">
              <select
                id="productId"
                name="productId"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                value={filters.productId}
                onChange={handleInputChange}
              >
                <option value="">All Products</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} ({product.stock_code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="inspectorId" className="block text-sm font-medium text-gray-700">
              Inspector
            </label>
            <div className="mt-1">
              <select
                id="inspectorId"
                name="inspectorId"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                value={filters.inspectorId}
                onChange={handleInputChange}
              >
                <option value="">All Inspectors</option>
                {inspectors.map((inspector) => (
                  <option key={inspector.id} value={inspector.id}>
                    {inspector.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <div className="mt-1">
              <select
                id="status"
                name="status"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                value={filters.status}
                onChange={handleInputChange}
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700">
              Date From
            </label>
            <div className="mt-1">
              <input
                type="date"
                name="dateFrom"
                id="dateFrom"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                value={filters.dateFrom}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700">
              Date To
            </label>
            <div className="mt-1">
              <input
                type="date"
                name="dateTo"
                id="dateTo"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                value={filters.dateTo}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        <div className="mt-5 text-right">
          <button
            type="button"
            className="rounded-md bg-white px-3.5 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
}
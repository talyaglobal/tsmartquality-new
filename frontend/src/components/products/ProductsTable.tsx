'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  stock_code: string;
  name: string;
  product_type?: {
    name: string;
  };
  brand?: {
    name: string;
  };
  quality_type?: {
    name: string;
  };
  created_at: string;
}

interface ProductsTableProps {
  products: Product[];
  isLoading: boolean;
}

export default function ProductsTable({ products, isLoading }: ProductsTableProps) {
  const [sortField, setSortField] = useState<keyof Product>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (field: keyof Product) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    // Handle nested objects
    if (sortField === 'product_type' || sortField === 'brand' || sortField === 'quality_type') {
      aValue = a[sortField]?.name || '';
      bValue = b[sortField]?.name || '';
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  if (isLoading) {
    return (
      <div className="mt-6 flow-root">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
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
            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No products</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new product.</p>
        <div className="mt-6">
          <Link
            href="/dashboard/products/new"
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
            New Product
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
                    onClick={() => handleSort('stock_code')}
                  >
                    <div className="flex items-center">
                      Stock Code
                      <span className="ml-1 flex-none rounded bg-gray-200 text-gray-900 group-hover:bg-gray-300">
                        {sortField === 'stock_code' && (
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
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Name
                      <span className="ml-1 flex-none rounded bg-gray-200 text-gray-900 group-hover:bg-gray-300">
                        {sortField === 'name' && (
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
                    onClick={() => handleSort('product_type')}
                  >
                    <div className="flex items-center">
                      Type
                      <span className="ml-1 flex-none rounded bg-gray-200 text-gray-900 group-hover:bg-gray-300">
                        {sortField === 'product_type' && (
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
                    onClick={() => handleSort('brand')}
                  >
                    <div className="flex items-center">
                      Brand
                      <span className="ml-1 flex-none rounded bg-gray-200 text-gray-900 group-hover:bg-gray-300">
                        {sortField === 'brand' && (
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
                    onClick={() => handleSort('quality_type')}
                  >
                    <div className="flex items-center">
                      Quality Type
                      <span className="ml-1 flex-none rounded bg-gray-200 text-gray-900 group-hover:bg-gray-300">
                        {sortField === 'quality_type' && (
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
                {sortedProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {product.stock_code}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{product.name}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {product.product_type?.name || '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {product.brand?.name || '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {product.quality_type?.name || '-'}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <Link
                        href={`/dashboard/products/${product.id}`}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        View
                      </Link>
                      <Link
                        href={`/dashboard/products/${product.id}/edit`}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        Edit
                      </Link>
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => window.confirm('Are you sure you want to delete this product?')}
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
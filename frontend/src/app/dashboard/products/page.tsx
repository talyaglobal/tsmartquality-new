'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductsTable from '@/components/products/ProductsTable';
import ProductsFilter, { ProductFilters } from '@/components/products/ProductsFilter';
import { productsAPI } from '@/lib/api';

// Sample data - in a real app, this would come from the API
const MOCK_PRODUCT_TYPES = [
  { id: 'type1', name: 'Raw Material' },
  { id: 'type2', name: 'Semi-Product' },
  { id: 'type3', name: 'Finished Product' },
];

const MOCK_BRANDS = [
  { id: 'brand1', name: 'Brand A' },
  { id: 'brand2', name: 'Brand B' },
  { id: 'brand3', name: 'Brand C' },
];

const MOCK_QUALITY_TYPES = [
  { id: 'quality1', name: 'Premium' },
  { id: 'quality2', name: 'Standard' },
  { id: 'quality3', name: 'Economy' },
];

// Sample product data - in a real app, this would come from the API
const MOCK_PRODUCTS = [
  {
    id: 'p1',
    stock_code: 'P001',
    name: 'Product A',
    product_type: { name: 'Raw Material' },
    brand: { name: 'Brand A' },
    quality_type: { name: 'Premium' },
    created_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'p2',
    stock_code: 'P002',
    name: 'Product B',
    product_type: { name: 'Semi-Product' },
    brand: { name: 'Brand B' },
    quality_type: { name: 'Standard' },
    created_at: '2023-01-02T00:00:00Z',
  },
  {
    id: 'p3',
    stock_code: 'P003',
    name: 'Product C',
    product_type: { name: 'Finished Product' },
    brand: { name: 'Brand C' },
    quality_type: { name: 'Economy' },
    created_at: '2023-01-03T00:00:00Z',
  },
  {
    id: 'p4',
    stock_code: 'P004',
    name: 'Product D',
    product_type: { name: 'Raw Material' },
    brand: { name: 'Brand A' },
    quality_type: { name: 'Premium' },
    created_at: '2023-01-04T00:00:00Z',
  },
  {
    id: 'p5',
    stock_code: 'P005',
    name: 'Product E',
    product_type: { name: 'Semi-Product' },
    brand: { name: 'Brand B' },
    quality_type: { name: 'Standard' },
    created_at: '2023-01-05T00:00:00Z',
  },
];

export default function ProductsPage() {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [filteredProducts, setFilteredProducts] = useState(MOCK_PRODUCTS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In a real application, we would fetch the products from the API
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Comment out for now since we're using mock data
        // const data = await productsAPI.getAll();
        // setProducts(data.products);
        // setFilteredProducts(data.products);
        
        // Using mock data
        setProducts(MOCK_PRODUCTS);
        setFilteredProducts(MOCK_PRODUCTS);
      } catch (err: any) {
        console.error('Failed to fetch products:', err);
        setError(err.message || 'Failed to fetch products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleFilterChange = (filters: ProductFilters) => {
    const filtered = products.filter((product) => {
      // Search filter
      if (
        filters.search &&
        !product.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !product.stock_code.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      // Product type filter
      if (
        filters.productType &&
        product.product_type?.name !== 
        MOCK_PRODUCT_TYPES.find((type) => type.id === filters.productType)?.name
      ) {
        return false;
      }

      // Brand filter
      if (
        filters.brand &&
        product.brand?.name !== 
        MOCK_BRANDS.find((brand) => brand.id === filters.brand)?.name
      ) {
        return false;
      }

      // Quality type filter
      if (
        filters.qualityType &&
        product.quality_type?.name !== 
        MOCK_QUALITY_TYPES.find((type) => type.id === filters.qualityType)?.name
      ) {
        return false;
      }

      return true;
    });

    setFilteredProducts(filtered);
  };

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all products in your inventory, including their stock code, name, type, brand, and quality type.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/dashboard/products/new"
            className="block rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            Add Product
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <ProductsFilter
          productTypes={MOCK_PRODUCT_TYPES}
          brands={MOCK_BRANDS}
          qualityTypes={MOCK_QUALITY_TYPES}
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

      <ProductsTable products={filteredProducts} isLoading={isLoading} />
    </div>
  );
}
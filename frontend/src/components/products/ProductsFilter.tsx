'use client';

import { useState } from 'react';

interface FilterOption {
  id: string;
  name: string;
}

interface ProductsFilterProps {
  productTypes: FilterOption[];
  brands: FilterOption[];
  qualityTypes: FilterOption[];
  onFilterChange: (filters: ProductFilters) => void;
}

export interface ProductFilters {
  search: string;
  productType: string;
  brand: string;
  qualityType: string;
}

export default function ProductsFilter({
  productTypes,
  brands,
  qualityTypes,
  onFilterChange,
}: ProductsFilterProps) {
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    productType: '',
    brand: '',
    qualityType: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedFilters = { ...filters, [name]: value };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      search: '',
      productType: '',
      brand: '',
      qualityType: '',
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold leading-6 text-gray-900">Filter Products</h3>
        <div className="mt-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Search
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="search"
                id="search"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Name or Stock Code"
                value={filters.search}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="productType" className="block text-sm font-medium text-gray-700">
              Product Type
            </label>
            <div className="mt-1">
              <select
                id="productType"
                name="productType"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                value={filters.productType}
                onChange={handleInputChange}
              >
                <option value="">All Types</option>
                {productTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
              Brand
            </label>
            <div className="mt-1">
              <select
                id="brand"
                name="brand"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                value={filters.brand}
                onChange={handleInputChange}
              >
                <option value="">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="qualityType" className="block text-sm font-medium text-gray-700">
              Quality Type
            </label>
            <div className="mt-1">
              <select
                id="qualityType"
                name="qualityType"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                value={filters.qualityType}
                onChange={handleInputChange}
              >
                <option value="">All Quality Types</option>
                {qualityTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
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
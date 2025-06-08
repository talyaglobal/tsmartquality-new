'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { productsAPI } from '@/lib/api';

interface Product {
  id?: string;
  stock_code: string;
  name: string;
  product_type_id: string;
  brand_id: string;
  quality_type_id: string;
  description: string;
  weight?: number;
  volume?: number;
  width?: number;
  height?: number;
  length?: number;
  critical_stock_amount?: number;
  shelflife_limit?: number;
  stock_tracking: boolean;
  bbd_tracking: boolean;
  lot_tracking: boolean;
}

interface ProductFormProps {
  product?: Product;
  productTypes: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  qualityTypes: { id: string; name: string }[];
  isEditing?: boolean;
}

const defaultProduct: Product = {
  stock_code: '',
  name: '',
  product_type_id: '',
  brand_id: '',
  quality_type_id: '',
  description: '',
  weight: undefined,
  volume: undefined,
  width: undefined,
  height: undefined,
  length: undefined,
  critical_stock_amount: undefined,
  shelflife_limit: undefined,
  stock_tracking: false,
  bbd_tracking: false,
  lot_tracking: false,
};

export default function ProductForm({
  product = defaultProduct,
  productTypes,
  brands,
  qualityTypes,
  isEditing = false,
}: ProductFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Product>(product);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === '' ? undefined : parseFloat(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (isEditing && product.id) {
        // In a real app, we would update the product
        // await productsAPI.update(product.id, formData);
        console.log('Update product:', formData);
      } else {
        // In a real app, we would create a new product
        // await productsAPI.create(formData);
        console.log('Create product:', formData);
      }

      // Redirect to products list
      router.push('/dashboard/products');
    } catch (err: any) {
      console.error('Failed to save product:', err);
      setError(err.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 divide-y divide-gray-200">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
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

      <div className="space-y-8 divide-y divide-gray-200">
        <div>
          <div>
            <h3 className="text-base font-semibold leading-6 text-gray-900">
              {isEditing ? 'Edit Product' : 'New Product'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {isEditing
                ? 'Update the product information below.'
                : 'Fill out the product information below to create a new product.'}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="stock_code" className="block text-sm font-medium leading-6 text-gray-900">
                Stock Code *
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="stock_code"
                  id="stock_code"
                  required
                  value={formData.stock_code}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                Product Name *
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="product_type_id" className="block text-sm font-medium leading-6 text-gray-900">
                Product Type *
              </label>
              <div className="mt-2">
                <select
                  id="product_type_id"
                  name="product_type_id"
                  required
                  value={formData.product_type_id}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                >
                  <option value="">Select a type</option>
                  {productTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="brand_id" className="block text-sm font-medium leading-6 text-gray-900">
                Brand
              </label>
              <div className="mt-2">
                <select
                  id="brand_id"
                  name="brand_id"
                  value={formData.brand_id}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                >
                  <option value="">Select a brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="quality_type_id" className="block text-sm font-medium leading-6 text-gray-900">
                Quality Type
              </label>
              <div className="mt-2">
                <select
                  id="quality_type_id"
                  name="quality_type_id"
                  value={formData.quality_type_id}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                >
                  <option value="">Select a quality type</option>
                  {qualityTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
                Description
              </label>
              <div className="mt-2">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Write a brief description of the product.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Product Specifications</h3>
          <p className="mt-1 text-sm text-gray-500">
            Enter the physical specifications of the product.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-2">
              <label htmlFor="weight" className="block text-sm font-medium leading-6 text-gray-900">
                Weight (kg)
              </label>
              <div className="mt-2">
                <input
                  type="number"
                  name="weight"
                  id="weight"
                  step="0.001"
                  min="0"
                  value={formData.weight === undefined ? '' : formData.weight}
                  onChange={handleNumberChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="volume" className="block text-sm font-medium leading-6 text-gray-900">
                Volume (m³)
              </label>
              <div className="mt-2">
                <input
                  type="number"
                  name="volume"
                  id="volume"
                  step="0.001"
                  min="0"
                  value={formData.volume === undefined ? '' : formData.volume}
                  onChange={handleNumberChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            
            <div className="sm:col-span-2"></div>

            <div className="sm:col-span-2">
              <label htmlFor="width" className="block text-sm font-medium leading-6 text-gray-900">
                Width (cm)
              </label>
              <div className="mt-2">
                <input
                  type="number"
                  name="width"
                  id="width"
                  step="0.1"
                  min="0"
                  value={formData.width === undefined ? '' : formData.width}
                  onChange={handleNumberChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="height" className="block text-sm font-medium leading-6 text-gray-900">
                Height (cm)
              </label>
              <div className="mt-2">
                <input
                  type="number"
                  name="height"
                  id="height"
                  step="0.1"
                  min="0"
                  value={formData.height === undefined ? '' : formData.height}
                  onChange={handleNumberChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="length" className="block text-sm font-medium leading-6 text-gray-900">
                Length (cm)
              </label>
              <div className="mt-2">
                <input
                  type="number"
                  name="length"
                  id="length"
                  step="0.1"
                  min="0"
                  value={formData.length === undefined ? '' : formData.length}
                  onChange={handleNumberChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8">
          <h3 className="text-base font-semibold leading-6 text-gray-900">Inventory Settings</h3>
          <p className="mt-1 text-sm text-gray-500">
            Configure inventory and tracking options for this product.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="critical_stock_amount" className="block text-sm font-medium leading-6 text-gray-900">
                Critical Stock Amount
              </label>
              <div className="mt-2">
                <input
                  type="number"
                  name="critical_stock_amount"
                  id="critical_stock_amount"
                  min="0"
                  value={formData.critical_stock_amount === undefined ? '' : formData.critical_stock_amount}
                  onChange={handleNumberChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Minimum stock level before alerts are triggered.
              </p>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="shelflife_limit" className="block text-sm font-medium leading-6 text-gray-900">
                Shelf Life Limit (days)
              </label>
              <div className="mt-2">
                <input
                  type="number"
                  name="shelflife_limit"
                  id="shelflife_limit"
                  min="0"
                  value={formData.shelflife_limit === undefined ? '' : formData.shelflife_limit}
                  onChange={handleNumberChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Number of days the product can be stored before expiration.
              </p>
            </div>

            <div className="sm:col-span-6">
              <div className="space-y-4">
                <div className="relative flex items-start">
                  <div className="flex h-6 items-center">
                    <input
                      id="stock_tracking"
                      name="stock_tracking"
                      type="checkbox"
                      checked={formData.stock_tracking}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                    />
                  </div>
                  <div className="ml-3 text-sm leading-6">
                    <label htmlFor="stock_tracking" className="font-medium text-gray-900">
                      Stock Tracking
                    </label>
                    <p className="text-gray-500">Enable stock level tracking for this product.</p>
                  </div>
                </div>

                <div className="relative flex items-start">
                  <div className="flex h-6 items-center">
                    <input
                      id="bbd_tracking"
                      name="bbd_tracking"
                      type="checkbox"
                      checked={formData.bbd_tracking}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                    />
                  </div>
                  <div className="ml-3 text-sm leading-6">
                    <label htmlFor="bbd_tracking" className="font-medium text-gray-900">
                      Best Before Date Tracking
                    </label>
                    <p className="text-gray-500">Enable expiration date tracking for this product.</p>
                  </div>
                </div>

                <div className="relative flex items-start">
                  <div className="flex h-6 items-center">
                    <input
                      id="lot_tracking"
                      name="lot_tracking"
                      type="checkbox"
                      checked={formData.lot_tracking}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600"
                    />
                  </div>
                  <div className="ml-3 text-sm leading-6">
                    <label htmlFor="lot_tracking" className="font-medium text-gray-900">
                      Lot Tracking
                    </label>
                    <p className="text-gray-500">Enable lot/batch tracking for this product.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-5">
        <div className="flex justify-end gap-x-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard/products')}
            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:bg-primary-400"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </div>
    </form>
  );
}
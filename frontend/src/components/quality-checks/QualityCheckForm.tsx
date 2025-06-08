'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { qualityChecksAPI } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  stock_code: string;
}

interface QualityCheck {
  id?: string;
  product_id: string;
  check_date: string;
  status: 'pending' | 'passed' | 'failed';
  notes: string;
}

interface QualityCheckFormProps {
  qualityCheck?: QualityCheck;
  products: Product[];
  isEditing?: boolean;
}

const defaultQualityCheck: QualityCheck = {
  product_id: '',
  check_date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
  status: 'pending',
  notes: '',
};

export default function QualityCheckForm({
  qualityCheck = defaultQualityCheck,
  products,
  isEditing = false,
}: QualityCheckFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<QualityCheck>(qualityCheck);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (isEditing && qualityCheck.id) {
        // In a real app, we would update the quality check
        // await qualityChecksAPI.update(qualityCheck.id, formData);
        console.log('Update quality check:', formData);
      } else {
        // In a real app, we would create a new quality check
        // await qualityChecksAPI.create(formData);
        console.log('Create quality check:', formData);
      }

      // Redirect to quality checks list
      router.push('/dashboard/quality-checks');
    } catch (err: any) {
      console.error('Failed to save quality check:', err);
      setError(err.message || 'Failed to save quality check');
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
              {isEditing ? 'Edit Quality Check' : 'New Quality Check'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {isEditing
                ? 'Update the quality check information below.'
                : 'Fill out the quality check information below.'}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="product_id" className="block text-sm font-medium leading-6 text-gray-900">
                Product *
              </label>
              <div className="mt-2">
                <select
                  id="product_id"
                  name="product_id"
                  required
                  value={formData.product_id}
                  onChange={handleChange}
                  disabled={isEditing} // Can't change product on edit
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6 disabled:bg-gray-100 disabled:text-gray-500"
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.stock_code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="check_date" className="block text-sm font-medium leading-6 text-gray-900">
                Check Date *
              </label>
              <div className="mt-2">
                <input
                  type="date"
                  name="check_date"
                  id="check_date"
                  required
                  value={formData.check_date}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label htmlFor="status" className="block text-sm font-medium leading-6 text-gray-900">
                Status *
              </label>
              <div className="mt-2">
                <select
                  id="status"
                  name="status"
                  required
                  value={formData.status}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                >
                  <option value="pending">Pending</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-6">
              <label htmlFor="notes" className="block text-sm font-medium leading-6 text-gray-900">
                Notes
              </label>
              <div className="mt-2">
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                  placeholder="Enter any notes or observations about this quality check"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-5">
        <div className="flex justify-end gap-x-3">
          <button
            type="button"
            onClick={() => router.push('/dashboard/quality-checks')}
            className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:bg-primary-400"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Quality Check' : 'Create Quality Check'}
          </button>
        </div>
      </div>
    </form>
  );
}
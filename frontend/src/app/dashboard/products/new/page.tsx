'use client';

import ProductForm from '@/components/products/ProductForm';

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

export default function NewProductPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Add New Product</h1>
        <p className="mt-2 text-sm text-gray-700">
          Create a new product by filling out the form below.
        </p>
      </div>

      <div className="bg-white shadow sm:rounded-lg p-6">
        <ProductForm 
          productTypes={MOCK_PRODUCT_TYPES} 
          brands={MOCK_BRANDS} 
          qualityTypes={MOCK_QUALITY_TYPES} 
        />
      </div>
    </div>
  );
}
'use client';

import QualityCheckForm from '@/components/quality-checks/QualityCheckForm';

// Sample data for products
const MOCK_PRODUCTS = [
  { id: 'p1', name: 'Product A', stock_code: 'P001' },
  { id: 'p2', name: 'Product B', stock_code: 'P002' },
  { id: 'p3', name: 'Product C', stock_code: 'P003' },
  { id: 'p4', name: 'Product D', stock_code: 'P004' },
  { id: 'p5', name: 'Product E', stock_code: 'P005' },
];

export default function NewQualityCheckPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">New Quality Check</h1>
        <p className="mt-2 text-sm text-gray-700">
          Create a new quality check by filling out the form below.
        </p>
      </div>

      <div className="bg-white shadow sm:rounded-lg p-6">
        <QualityCheckForm products={MOCK_PRODUCTS} />
      </div>
    </div>
  );
}
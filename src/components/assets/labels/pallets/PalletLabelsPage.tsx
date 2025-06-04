import React from 'react';
import { Package } from 'lucide-react';

const PalletLabelsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Package className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Pallet Labels</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Manage and generate your pallet labels here.</p>
      </div>
    </div>
  );
};

export default PalletLabelsPage;
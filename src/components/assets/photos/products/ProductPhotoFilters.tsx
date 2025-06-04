import React from 'react';
import { Filter, X } from 'lucide-react';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';

interface ProductPhotoFiltersProps {
  onFilterChange: (filters: any) => void;
}

const ProductPhotoFilters: React.FC<ProductPhotoFiltersProps> = ({ onFilterChange }) => {
  return (
    <div className="bg-[var(--background-paper)] p-4 rounded-lg border border-[var(--divider)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Filter size={20} className="text-[var(--text-secondary)] mr-2" />
          <h3 className="font-medium">Filters</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={<X size={16} />}
          onClick={() => onFilterChange({})}
        >
          Reset
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Product Category
          </label>
          <select
            className="w-full border border-[var(--divider)] rounded-md p-2"
            onChange={(e) => onFilterChange({ category: e.target.value })}
          >
            <option value="">All Categories</option>
            <option value="food">Food Products</option>
            <option value="beverages">Beverages</option>
            <option value="packaging">Packaging</option>
            <option value="raw-materials">Raw Materials</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Photo Type
          </label>
          <select
            className="w-full border border-[var(--divider)] rounded-md p-2"
            onChange={(e) => onFilterChange({ type: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="product">Product</option>
            <option value="lifestyle">Lifestyle</option>
            <option value="ingredients">Ingredients</option>
            <option value="process">Process</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Date Range
          </label>
          <select
            className="w-full border border-[var(--divider)] rounded-md p-2"
            onChange={(e) => onFilterChange({ dateRange: e.target.value })}
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProductPhotoFilters;
import React from 'react';
import { Filter, X } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface CustomerFiltersProps {
  onFilterChange: (filters: any) => void;
  onReset: () => void;
}

const CustomerFilters: React.FC<CustomerFiltersProps> = ({ onFilterChange, onReset }) => {
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
          onClick={onReset}
        >
          Reset
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Category
          </label>
          <select
            className="w-full border border-[var(--divider)] rounded-md p-2"
            onChange={(e) => onFilterChange({ category: e.target.value })}
          >
            <option value="">All Categories</option>
            <option value="cash-cow">Cash Cows</option>
            <option value="star">Stars</option>
            <option value="problem-child">Problem Children</option>
            <option value="dog">Dogs</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Rating
          </label>
          <select
            className="w-full border border-[var(--divider)] rounded-md p-2"
            onChange={(e) => onFilterChange({ rating: e.target.value })}
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
            <option value="1">1+ Star</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Account Type
          </label>
          <select
            className="w-full border border-[var(--divider)] rounded-md p-2"
            onChange={(e) => onFilterChange({ accountType: e.target.value })}
          >
            <option value="">All Accounts</option>
            <option value="strategic">Strategic Accounts</option>
            <option value="regular">Regular Accounts</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Status
          </label>
          <select
            className="w-full border border-[var(--divider)] rounded-md p-2"
            onChange={(e) => onFilterChange({ status: e.target.value })}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Last Order
          </label>
          <select
            className="w-full border border-[var(--divider)] rounded-md p-2"
            onChange={(e) => onFilterChange({ lastOrder: e.target.value })}
          >
            <option value="">All Time</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default CustomerFilters;
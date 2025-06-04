import React from 'react';
import { Search } from 'lucide-react';
import Input from '../../../ui/Input';

interface BoxPhotoFiltersProps {
  onFilterChange?: (filters: any) => void;
}

const BoxPhotoFilters: React.FC<BoxPhotoFiltersProps> = ({ onFilterChange }) => {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search box photos..."
            startIcon={<Search size={20} />}
            onChange={(e) => onFilterChange?.({ search: e.target.value })}
          />
        </div>
        <div className="flex items-center space-x-2">
          <div>
            <select 
              className="border border-[var(--divider)] rounded-md px-3 py-2"
              onChange={(e) => onFilterChange?.({ dateRange: e.target.value })}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <div>
            <select 
              className="border border-[var(--divider)] rounded-md px-3 py-2"
              onChange={(e) => onFilterChange?.({ boxType: e.target.value })}
            >
              <option value="all">All Box Types</option>
              <option value="primary">Primary Packaging</option>
              <option value="secondary">Secondary Packaging</option>
              <option value="shipping">Shipping Box</option>
              <option value="display">Display Box</option>
            </select>
          </div>
          <div>
            <select 
              className="border border-[var(--divider)] rounded-md px-3 py-2"
              onChange={(e) => onFilterChange?.({ view: e.target.value })}
            >
              <option value="all">All Views</option>
              <option value="front">Front View</option>
              <option value="back">Back View</option>
              <option value="side">Side View</option>
              <option value="top">Top View</option>
              <option value="bottom">Bottom View</option>
              <option value="3d">3D View</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoxPhotoFilters;
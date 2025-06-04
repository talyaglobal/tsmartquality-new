import React from 'react';
import { Search } from 'lucide-react';
import Input from '../../../ui/Input';

interface PalletPhotoFiltersProps {
  onFilterChange?: (filters: any) => void;
}

const PalletPhotoFilters: React.FC<PalletPhotoFiltersProps> = ({ onFilterChange }) => {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search pallet photos..."
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
              onChange={(e) => onFilterChange?.({ palletType: e.target.value })}
            >
              <option value="all">All Pallet Types</option>
              <option value="euro">Euro Pallet</option>
              <option value="block">Block Pallet</option>
              <option value="stringer">Stringer Pallet</option>
              <option value="custom">Custom Pallet</option>
            </select>
          </div>
          <div>
            <select 
              className="border border-[var(--divider)] rounded-md px-3 py-2"
              onChange={(e) => onFilterChange?.({ view: e.target.value })}
            >
              <option value="all">All Views</option>
              <option value="front">Front View</option>
              <option value="side">Side View</option>
              <option value="top">Top View</option>
              <option value="loaded">Loaded</option>
              <option value="empty">Empty</option>
              <option value="3d">3D View</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PalletPhotoFilters;
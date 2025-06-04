import React from 'react';
import { Search, Filter, Calendar, Image as ImageIcon } from 'lucide-react';
import Input from '../../ui/Input';

interface PhotoFiltersProps {
  onFilterChange?: (filters: any) => void;
}

const PhotoFilters: React.FC<PhotoFiltersProps> = ({ onFilterChange }) => {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search photos..."
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
              onChange={(e) => onFilterChange?.({ category: e.target.value })}
            >
              <option value="all">All Categories</option>
              <option value="products">Products</option>
              <option value="packaging">Packaging</option>
              <option value="lifestyle">Lifestyle</option>
              <option value="marketing">Marketing</option>
            </select>
          </div>
          <div>
            <select 
              className="border border-[var(--divider)] rounded-md px-3 py-2"
              onChange={(e) => onFilterChange?.({ type: e.target.value })}
            >
              <option value="all">All Types</option>
              <option value="jpg">JPG</option>
              <option value="png">PNG</option>
              <option value="gif">GIF</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoFilters;
import React from 'react';
import { Filter, X } from 'lucide-react';
import Button from '../../ui/Button';

interface ShelvesFiltersProps {
  onFilterChange: (filters: any) => void;
}

const ShelvesFilters: React.FC<ShelvesFiltersProps> = ({ onFilterChange }) => {
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
            Zone
          </label>
          <select
            className="w-full border border-[var(--divider)] rounded-md p-2"
            onChange={(e) => onFilterChange({ zone: e.target.value })}
          >
            <option value="">All Zones</option>
            <option value="A">Zone A</option>
            <option value="B">Zone B</option>
            <option value="C">Zone C</option>
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
            <option value="available">Available</option>
            <option value="full">Full</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Utilization
          </label>
          <select
            className="w-full border border-[var(--divider)] rounded-md p-2"
            onChange={(e) => onFilterChange({ utilization: e.target.value })}
          >
            <option value="">All</option>
            <option value="low">Low (0-50%)</option>
            <option value="medium">Medium (51-75%)</option>
            <option value="high">High (76-90%)</option>
            <option value="critical">Critical (>90%)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ShelvesFilters;
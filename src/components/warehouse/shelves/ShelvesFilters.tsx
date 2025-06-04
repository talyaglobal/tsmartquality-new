import React from 'react';
import { Filter, X } from 'lucide-react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';

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
            <option value="D">Zone D</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Aisle
          </label>
          <select
            className="w-full border border-[var(--divider)] rounded-md p-2"
            onChange={(e) => onFilterChange({ aisle: e.target.value })}
          >
            <option value="">All Aisles</option>
            {[...Array(10)].map((_, i) => (
              <option key={i} value={`${(i + 1).toString().padStart(2, '0')}`}>
                Aisle {(i + 1).toString().padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Level
          </label>
          <select
            className="w-full border border-[var(--divider)] rounded-md p-2"
            onChange={(e) => onFilterChange({ level: e.target.value })}
          >
            <option value="">All Levels</option>
            {[...Array(5)].map((_, i) => (
              <option key={i} value={i + 1}>Level {i + 1}</option>
            ))}
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
            <option value="reserved">Reserved</option>
            <option value="blocked">Blocked</option>
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
            <option value="empty">Empty (0%)</option>
            <option value="low">Low (1-25%)</option>
            <option value="medium">Medium (26-75%)</option>
            <option value="high">High (76-90%)</option>
            <option value="critical">Critical (&gt;90%)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Last Inspection
          </label>
          <select
            className="w-full border border-[var(--divider)] rounded-md p-2"
            onChange={(e) => onFilterChange({ inspection: e.target.value })}
          >
            <option value="">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Capacity Range (Min)"
          type="number"
          placeholder="Minimum capacity"
          onChange={(e) => onFilterChange({ minCapacity: e.target.value })}
        />
        <Input
          label="Capacity Range (Max)"
          type="number"
          placeholder="Maximum capacity"
          onChange={(e) => onFilterChange({ maxCapacity: e.target.value })}
        />
      </div>
    </div>
  );
};

export default ShelvesFilters;
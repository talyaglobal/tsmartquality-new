import React from 'react'
import { Filter, X } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'

interface SupplierFiltersProps {
  onFilterChange: (filters: any) => void
  onReset: () => void
}

const SupplierFilters: React.FC<SupplierFiltersProps> = ({ onFilterChange, onReset }) => {
  // Sample data - replace with actual data from your API
  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' }
  ]

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
            <option value="raw-materials">Raw Materials</option>
            <option value="packaging">Packaging</option>
            <option value="equipment">Equipment</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Type
          </label>
          <select
            className="w-full border border-[var(--divider)] rounded-md p-2"
            onChange={(e) => onFilterChange({ type: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="preferred">Preferred</option>
            <option value="regular">Regular</option>
            <option value="blacklist">Blacklisted</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Country
          </label>
          <select
            className="w-full border border-[var(--divider)] rounded-md p-2"
            onChange={(e) => onFilterChange({ country: e.target.value })}
          >
            <option value="">All Countries</option>
            {countries.map(country => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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
            <option value="under-review">Under Review</option>
            <option value="inactive">Inactive</option>
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
            <option value="A">A Rating</option>
            <option value="B">B Rating</option>
            <option value="C">C Rating</option>
            <option value="D">D Rating</option>
            <option value="F">F Rating</option>
          </select>
        </div>
      </div>
    </div>
  )
}

export default SupplierFilters
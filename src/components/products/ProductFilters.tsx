import React from 'react'
import { Filter, X } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'

interface ProductFiltersProps {
  onFilterChange: (filters: any) => void
  onReset: () => void
}

const ProductFilters: React.FC<ProductFiltersProps> = ({ onFilterChange, onReset }) => {
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
        <Input
          label="Product Code"
          placeholder="Enter product code"
          onChange={(e) => onFilterChange({ code: e.target.value })}
        />
        <Input
          label="Status"
          placeholder="Select status"
          onChange={(e) => onFilterChange({ status: e.target.value })}
        />
        <Input
          label="Date Range"
          type="date"
          onChange={(e) => onFilterChange({ date: e.target.value })}
        />
      </div>
    </div>
  )
}

export default ProductFilters
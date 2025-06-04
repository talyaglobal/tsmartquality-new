import React from 'react'
import { Filter, X } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'

interface AuditFiltersProps {
  onFilterChange: (filters: any) => void
  onReset: () => void
}

const AuditFilters: React.FC<AuditFiltersProps> = ({ onFilterChange, onReset }) => {
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
            Audit Type
          </label>
          <select
            className="w-full border border-[var(--divider)] rounded-md p-2"
            onChange={(e) => onFilterChange({ type: e.target.value })}
          >
            <option value="">All Types</option>
            <option value="internal">Internal Audit</option>
            <option value="external">External Audit</option>
            <option value="supplier">Supplier Audit</option>
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
            <option value="scheduled">Scheduled</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <Input
          label="Date Range"
          type="date"
          onChange={(e) => onFilterChange({ date: e.target.value })}
        />
      </div>
    </div>
  )
}

export default AuditFilters
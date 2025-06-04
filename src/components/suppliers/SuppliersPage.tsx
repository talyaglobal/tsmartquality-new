import React, { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import SupplierGrid from './SupplierGrid'
import SupplierFilters from './SupplierFilters'
import SupplierForm from './SupplierForm'
import FilterBadges from '../ui/FilterBadges'

const SuppliersPage: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const filterBadges = [
    { id: 'preferred', label: 'Preferred Suppliers', count: 15, color: 'success' },
    { id: 'regular', label: 'Regular Suppliers', count: 45, color: 'info' },
    { id: 'blacklist', label: 'Blacklisted', count: 3, color: 'error' },
    { id: 'active', label: 'Active', count: 52, color: 'success' },
    { id: 'under-review', label: 'Under Review', count: 8, color: 'warning' },
    { id: 'inactive', label: 'Inactive', count: 3, color: 'error' }
  ]

  const handleFilterChange = (filters: any) => {
    console.log('Filters changed:', filters)
  }

  const handleFilterReset = () => {
    console.log('Filters reset')
  }

  const handleSupplierSubmit = (data: any) => {
    console.log('Supplier submitted:', data)
    setShowForm(false)
  }

  const handleClearBadge = (id: string) => {
    console.log('Clear badge:', id)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Suppliers</h1>
          <p className="text-[var(--text-secondary)]">
            Manage your supplier relationships and quality metrics
          </p>
        </div>
        <Button 
          icon={<Plus size={20} />}
          onClick={() => setShowForm(true)}
        >
          Add Supplier
        </Button>
      </div>

      {showForm && (
        <Card title="Add New Supplier">
          <SupplierForm onSubmit={handleSupplierSubmit} />
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="w-96">
            <Input
              placeholder="Search suppliers..."
              startIcon={<Search size={20} />}
            />
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">Export</Button>
            <Button 
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              Filter
            </Button>
          </div>
        </div>

        <FilterBadges badges={filterBadges} onClear={handleClearBadge} />

        {showFilters && (
          <div className="mb-6">
            <SupplierFilters
              onFilterChange={handleFilterChange}
              onReset={handleFilterReset}
            />
          </div>
        )}

        <SupplierGrid />
      </Card>
    </div>
  )
}

export default SuppliersPage
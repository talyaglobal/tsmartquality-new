import React, { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import ServiceGrid from './ServiceGrid'
import ServiceFilters from './ServiceFilters'
import ServiceForm from './ServiceForm'
import FilterBadges from '../ui/FilterBadges'

const ServicesPage: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const filterBadges = [
    { id: 'active', label: 'Active Services', count: 12, color: 'success' },
    { id: 'pending', label: 'Pending Review', count: 5, color: 'warning' },
    { id: 'inactive', label: 'Inactive', count: 3, color: 'error' },
    { id: 'maintenance', label: 'Maintenance', count: 2, color: 'info' }
  ]

  const handleFilterChange = (filters: any) => {
    console.log('Filters changed:', filters)
  }

  const handleFilterReset = () => {
    console.log('Filters reset')
  }

  const handleServiceSubmit = (data: any) => {
    console.log('Service submitted:', data)
    setShowForm(false)
  }

  const handleClearBadge = (id: string) => {
    console.log('Clear badge:', id)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Services</h1>
          <p className="text-[var(--text-secondary)]">
            Manage your service offerings and quality standards
          </p>
        </div>
        <Button 
          icon={<Plus size={20} />}
          onClick={() => setShowForm(true)}
        >
          Add Service
        </Button>
      </div>

      {showForm && (
        <Card title="Add New Service">
          <ServiceForm onSubmit={handleServiceSubmit} />
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="w-96">
            <Input
              placeholder="Search services..."
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
            <ServiceFilters
              onFilterChange={handleFilterChange}
              onReset={handleFilterReset}
            />
          </div>
        )}

        <ServiceGrid />
      </Card>
    </div>
  )
}

export default ServicesPage
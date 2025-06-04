import React, { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import ComplaintGrid from './ComplaintGrid'
import ComplaintFilters from './ComplaintFilters'
import ComplaintForm from './ComplaintForm'
import FilterBadges from '../ui/FilterBadges'

const ComplaintManagement: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const filterBadges = [
    { id: 'open', label: 'Open', count: 12, color: 'error' },
    { id: 'in-progress', label: 'In Progress', count: 8, color: 'warning' },
    { id: 'closed', label: 'Closed', count: 45, color: 'success' },
    { id: 'high-priority', label: 'High Priority', count: 5, color: 'error' },
    { id: 'medium-priority', label: 'Medium Priority', count: 10, color: 'warning' },
    { id: 'low-priority', label: 'Low Priority', count: 50, color: 'info' }
  ]

  const handleFilterChange = (filters: any) => {
    console.log('Filters changed:', filters)
  }

  const handleFilterReset = () => {
    console.log('Filters reset')
  }

  const handleComplaintSubmit = (data: any) => {
    console.log('Complaint submitted:', data)
    setShowForm(false)
  }

  const handleClearBadge = (id: string) => {
    console.log('Clear badge:', id)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Complaints Management</h1>
          <p className="text-[var(--text-secondary)]">
            Track and manage customer complaints and resolutions
          </p>
        </div>
        <Button 
          icon={<Plus size={20} />}
          onClick={() => setShowForm(true)}
        >
          Add Complaint
        </Button>
      </div>

      {showForm && (
        <Card title="Add New Complaint">
          <ComplaintForm onSubmit={handleComplaintSubmit} />
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="w-96">
            <Input
              placeholder="Search complaints..."
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
            <ComplaintFilters
              onFilterChange={handleFilterChange}
              onReset={handleFilterReset}
            />
          </div>
        )}

        <ComplaintGrid />
      </Card>
    </div>
  )
}

export default ComplaintManagement
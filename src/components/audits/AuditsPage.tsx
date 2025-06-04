import React, { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import AuditGrid from './AuditGrid'
import AuditFilters from './AuditFilters'
import AuditForm from './AuditForm'
import FilterBadges from '../ui/FilterBadges'

const AuditsPage: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const filterBadges = [
    { id: 'internal', label: 'Internal Audits', count: 12, color: 'info' },
    { id: 'external', label: 'External Audits', count: 5, color: 'warning' },
    { id: 'supplier', label: 'Supplier Audits', count: 8, color: 'success' },
    { id: 'scheduled', label: 'Scheduled', count: 15, color: 'primary' },
    { id: 'in-progress', label: 'In Progress', count: 7, color: 'warning' },
    { id: 'completed', label: 'Completed', count: 3, color: 'success' }
  ]

  const handleFilterChange = (filters: any) => {
    console.log('Filters changed:', filters)
  }

  const handleFilterReset = () => {
    console.log('Filters reset')
  }

  const handleAuditSubmit = (data: any) => {
    console.log('Audit submitted:', data)
    setShowForm(false)
  }

  const handleClearBadge = (id: string) => {
    console.log('Clear badge:', id)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Audits</h1>
          <p className="text-[var(--text-secondary)]">
            Manage and track quality audits across your organization
          </p>
        </div>
        <Button 
          icon={<Plus size={20} />}
          onClick={() => setShowForm(true)}
        >
          Schedule Audit
        </Button>
      </div>

      {showForm && (
        <Card title="Schedule New Audit">
          <AuditForm onSubmit={handleAuditSubmit} />
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="w-96">
            <Input
              placeholder="Search audits..."
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
            <AuditFilters
              onFilterChange={handleFilterChange}
              onReset={handleFilterReset}
            />
          </div>
        )}

        <AuditGrid />
      </Card>
    </div>
  )
}

export default AuditsPage
import React, { useState } from 'react'
import { FileText, Plus, Search } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import DocumentGrid from './DocumentGrid'
import DocumentFilters from './DocumentFilters'
import DocumentForm from './DocumentForm'

const DocumentManagement: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const handleFilterChange = (filters: any) => {
    console.log('Filters changed:', filters)
  }

  const handleFilterReset = () => {
    console.log('Filters reset')
  }

  const handleDocumentSubmit = (data: any) => {
    console.log('Document submitted:', data)
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Document Management</h1>
          <p className="text-[var(--text-secondary)]">
            Manage your quality documentation and specifications
          </p>
        </div>
        <Button 
          icon={<Plus size={20} />}
          onClick={() => setShowForm(true)}
        >
          Add Document
        </Button>
      </div>

      {showForm && (
        <Card title="Add New Document">
          <DocumentForm onSubmit={handleDocumentSubmit} />
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="w-96">
            <Input
              placeholder="Search documents..."
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

        {showFilters && (
          <div className="mb-6">
            <DocumentFilters
              onFilterChange={handleFilterChange}
              onReset={handleFilterReset}
            />
          </div>
        )}

        <DocumentGrid />
      </Card>
    </div>
  )
}

export default DocumentManagement
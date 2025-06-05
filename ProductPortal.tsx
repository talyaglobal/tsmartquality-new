import React, { useState } from 'react'
import { Plus, Search, BarChart2, Columns } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import ProductGrid from './ProductGrid'
import ProductFilters from './ProductFilters'
import ProductForm from './ProductForm'
import ProductColumnManager from './ProductColumnManager'

interface Column {
  id: string
  name: string
  type: 'text' | 'number' | 'date' | 'select' | 'boolean'
  required: boolean
  options?: string[]
  owner: string
  accessLevel: 'private' | 'department' | 'public'
  department?: string
  validation?: string
}

const ProductPortal: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showColumnManager, setShowColumnManager] = useState(false)
  const navigate = useNavigate()

  // Initial columns configuration
  const [columns, setColumns] = useState<Column[]>([
    {
      id: '1',
      name: 'Product Name',
      type: 'text',
      required: true,
      owner: 'system',
      accessLevel: 'public'
    },
    {
      id: '2',
      name: 'Product Code',
      type: 'text',
      required: true,
      owner: 'system',
      accessLevel: 'public'
    },
    {
      id: '3',
      name: 'Category',
      type: 'select',
      required: true,
      options: ['Raw Materials', 'Packaging', 'Finished Goods'],
      owner: 'Quality Control',
      accessLevel: 'public'
    },
    {
      id: '4',
      name: 'Quality Status',
      type: 'select',
      required: true,
      options: ['Approved', 'Pending', 'Rejected'],
      owner: 'Quality Control',
      accessLevel: 'department',
      department: 'Quality Control'
    },
    {
      id: '5',
      name: 'Specifications',
      type: 'text',
      required: true,
      owner: 'R&D',
      accessLevel: 'department',
      department: 'R&D'
    }
  ])

  const handleFilterChange = (filters: any) => {
    console.log('Filters changed:', filters)
  }

  const handleFilterReset = () => {
    console.log('Filters reset')
  }

  const handleProductSubmit = (data: any) => {
    console.log('Product submitted:', data)
    setShowForm(false)
  }

  const handleColumnsUpdate = (updatedColumns: Column[]) => {
    setColumns(updatedColumns)
    setShowColumnManager(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Product Portal</h1>
          <p className="text-[var(--text-secondary)]">
            Manage your product specifications and documentation
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            icon={<BarChart2 size={20} />}
            onClick={() => navigate('/products/dashboard')}
          >
            View Dashboard
          </Button>
          <Button 
            variant="outline"
            icon={<Columns size={20} />}
            onClick={() => setShowColumnManager(true)}
          >
            Manage Columns
          </Button>
          <Button 
            icon={<Plus size={20} />}
            onClick={() => setShowForm(true)}
          >
            Add Product
          </Button>
        </div>
      </div>

      {showForm && (
        <Card title="Add New Product">
          <ProductForm onSubmit={handleProductSubmit} columns={columns} />
        </Card>
      )}

      {showColumnManager && (
        <ProductColumnManager
          initialColumns={columns}
          onSave={handleColumnsUpdate}
          onClose={() => setShowColumnManager(false)}
        />
      )}

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="w-96">
            <Input
              placeholder="Search products..."
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
            <ProductFilters
              onFilterChange={handleFilterChange}
              onReset={handleFilterReset}
              columns={columns}
            />
          </div>
        )}

        <ProductGrid columns={columns} />
      </Card>
    </div>
  )
}

export default ProductPortal
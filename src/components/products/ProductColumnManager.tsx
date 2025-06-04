import React, { useState } from 'react'
import { Columns, Plus, X, Lock, Users, Database } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'

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

interface ProductColumnManagerProps {
  onClose: () => void
  onSave: (columns: Column[]) => void
  initialColumns?: Column[]
}

const ProductColumnManager: React.FC<ProductColumnManagerProps> = ({
  onClose,
  onSave,
  initialColumns = []
}) => {
  const [columns, setColumns] = useState<Column[]>(initialColumns)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newColumn, setNewColumn] = useState<Partial<Column>>({
    type: 'text',
    required: false,
    accessLevel: 'public'
  })

  // Sample departments - replace with actual data from your API
  const departments = [
    'Quality Control',
    'Production',
    'R&D',
    'Regulatory Affairs',
    'Supply Chain'
  ]

  const handleAddColumn = () => {
    if (!newColumn.name) return

    const column: Column = {
      id: Date.now().toString(),
      name: newColumn.name,
      type: newColumn.type || 'text',
      required: newColumn.required || false,
      owner: newColumn.owner || 'system',
      accessLevel: newColumn.accessLevel || 'public',
      department: newColumn.department,
      options: newColumn.type === 'select' ? newColumn.options : undefined,
      validation: newColumn.validation
    }

    setColumns([...columns, column])
    setNewColumn({
      type: 'text',
      required: false,
      accessLevel: 'public'
    })
    setShowAddForm(false)
  }

  const handleRemoveColumn = (id: string) => {
    setColumns(columns.filter(col => col.id !== id))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return 'Aa'
      case 'number':
        return '123'
      case 'date':
        return '📅'
      case 'select':
        return '▼'
      case 'boolean':
        return '✓'
      default:
        return 'Aa'
    }
  }

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Columns className="mr-2 text-[var(--primary-main)]" size={24} />
          <h2 className="text-lg font-semibold">Manage Product Columns</h2>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={() => onSave(columns)}
          >
            Save Changes
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {columns.map(column => (
          <div
            key={column.id}
            className="flex items-center justify-between p-4 border border-[var(--divider)] rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 flex items-center justify-center bg-[var(--primary-light)] text-[var(--primary-dark)] rounded">
                {getTypeIcon(column.type)}
              </div>
              <div>
                <h3 className="font-medium">{column.name}</h3>
                <div className="flex items-center space-x-2 text-sm text-[var(--text-secondary)]">
                  <span>{column.type}</span>
                  {column.required && (
                    <span className="text-[var(--error-main)]">*</span>
                  )}
                  {column.accessLevel !== 'public' && (
                    <Lock size={14} className="text-[var(--warning-main)]" />
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-[var(--text-secondary)]">
                <div className="flex items-center">
                  <Users size={14} className="mr-1" />
                  {column.accessLevel}
                </div>
                <div className="flex items-center">
                  <Database size={14} className="mr-1" />
                  {column.owner}
                </div>
              </div>
              <Button
                variant="danger"
                size="sm"
                icon={<X size={16} />}
                onClick={() => handleRemoveColumn(column.id)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}

        {showAddForm ? (
          <div className="p-4 border border-[var(--divider)] rounded-lg">
            <h3 className="font-medium mb-4">Add New Column</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Column Name"
                value={newColumn.name || ''}
                onChange={(e) => setNewColumn({ ...newColumn, name: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Data Type
                </label>
                <select
                  className="w-full border border-[var(--divider)] rounded-md p-2"
                  value={newColumn.type}
                  onChange={(e) => setNewColumn({ ...newColumn, type: e.target.value as any })}
                >
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="date">Date</option>
                  <option value="select">Select</option>
                  <option value="boolean">Boolean</option>
                </select>
              </div>
            </div>

            {newColumn.type === 'select' && (
              <div className="mt-4">
                <Input
                  label="Options (comma-separated)"
                  value={newColumn.options?.join(', ') || ''}
                  onChange={(e) => setNewColumn({
                    ...newColumn,
                    options: e.target.value.split(',').map(opt => opt.trim())
                  })}
                  placeholder="Enter options separated by commas"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Owner Department
                </label>
                <select
                  className="w-full border border-[var(--divider)] rounded-md p-2"
                  value={newColumn.department}
                  onChange={(e) => setNewColumn({ ...newColumn, department: e.target.value })}
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Access Level
                </label>
                <select
                  className="w-full border border-[var(--divider)] rounded-md p-2"
                  value={newColumn.accessLevel}
                  onChange={(e) => setNewColumn({
                    ...newColumn,
                    accessLevel: e.target.value as 'private' | 'department' | 'public'
                  })}
                >
                  <option value="public">Public</option>
                  <option value="department">Department Only</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <Input
                label="Validation Rule"
                value={newColumn.validation || ''}
                onChange={(e) => setNewColumn({ ...newColumn, validation: e.target.value })}
                placeholder="Enter validation rule (optional)"
              />
            </div>

            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="required"
                checked={newColumn.required}
                onChange={(e) => setNewColumn({ ...newColumn, required: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="required" className="text-sm text-[var(--text-secondary)]">
                This field is required
              </label>
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddColumn}
                disabled={!newColumn.name}
              >
                Add Column
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            icon={<Plus size={20} />}
            onClick={() => setShowAddForm(true)}
            className="w-full"
          >
            Add New Column
          </Button>
        )}
      </div>
    </Card>
  )
}

export default ProductColumnManager
import React, { useState } from 'react'
import { Plus, X, Edit2 } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'

interface SupplierCategory {
  id: string
  name: string
  description: string
  qualificationCriteria: string
  evaluationFrequency: string
  riskLevel: string
}

const SupplierCategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<SupplierCategory[]>([
    {
      id: '1',
      name: 'Raw Materials',
      description: 'Suppliers of raw materials and ingredients',
      qualificationCriteria: 'ISO 9001, HACCP Certification',
      evaluationFrequency: 'Quarterly',
      riskLevel: 'High'
    },
    {
      id: '2',
      name: 'Packaging',
      description: 'Suppliers of packaging materials',
      qualificationCriteria: 'ISO 9001, Food Safety Certification',
      evaluationFrequency: 'Semi-annual',
      riskLevel: 'Medium'
    }
  ])
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<SupplierCategory | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const newCategory = {
      id: editingCategory?.id || Date.now().toString(),
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      qualificationCriteria: formData.get('qualificationCriteria') as string,
      evaluationFrequency: formData.get('evaluationFrequency') as string,
      riskLevel: formData.get('riskLevel') as string
    }

    if (editingCategory) {
      setCategories(categories.map(cat => cat.id === editingCategory.id ? newCategory : cat))
    } else {
      setCategories([...categories, newCategory])
    }

    setShowForm(false)
    setEditingCategory(null)
    form.reset()
  }

  const handleEdit = (category: SupplierCategory) => {
    setEditingCategory(category)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id))
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold">Supplier Category Management</h2>
            <p className="text-[var(--text-secondary)]">
              Manage supplier categories and their qualification criteria
            </p>
          </div>
          <Button
            icon={<Plus size={20} />}
            onClick={() => {
              setEditingCategory(null)
              setShowForm(true)
            }}
          >
            Add Category
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 border border-[var(--divider)] rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="name"
                label="Category Name"
                defaultValue={editingCategory?.name}
                required
              />
              <Input
                name="riskLevel"
                label="Risk Level"
                defaultValue={editingCategory?.riskLevel}
                required
              />
            </div>
            <div className="mt-4">
              <Input
                name="description"
                label="Description"
                multiline
                rows={3}
                defaultValue={editingCategory?.description}
                required
              />
            </div>
            <div className="mt-4">
              <Input
                name="qualificationCriteria"
                label="Qualification Criteria"
                multiline
                rows={3}
                defaultValue={editingCategory?.qualificationCriteria}
                required
              />
            </div>
            <div className="mt-4">
              <Input
                name="evaluationFrequency"
                label="Evaluation Frequency"
                defaultValue={editingCategory?.evaluationFrequency}
                required
              />
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingCategory(null)
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingCategory ? 'Update Category' : 'Create Category'}
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {categories.map(category => (
            <div
              key={category.id}
              className="p-4 border border-[var(--divider)] rounded-lg hover:border-[var(--primary-main)] transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-medium">{category.name}</h3>
                  <span className={`text-sm px-2 py-1 rounded-full
                    ${category.riskLevel === 'High' ? 'bg-[var(--error-light)] text-[var(--error-dark)]' :
                      category.riskLevel === 'Medium' ? 'bg-[var(--warning-light)] text-[var(--warning-dark)]' :
                      'bg-[var(--success-light)] text-[var(--success-dark)]'}`}>
                    {category.riskLevel} Risk
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Edit2 size={16} />}
                    onClick={() => handleEdit(category)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<X size={16} />}
                    onClick={() => handleDelete(category.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-2">
                {category.description}
              </p>
              <div className="mt-3 space-y-2">
                <div>
                  <span className="text-sm font-medium">Qualification Criteria:</span>
                  <p className="text-sm text-[var(--text-secondary)]">{category.qualificationCriteria}</p>
                </div>
                <div>
                  <span className="text-sm font-medium">Evaluation Frequency:</span>
                  <p className="text-sm text-[var(--text-secondary)]">{category.evaluationFrequency}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default SupplierCategoryManagement
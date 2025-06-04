import React, { useState } from 'react'
import { Plus, X, Edit2, List, GitBranch } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'

interface Category {
  id: string
  name: string
  description: string
  parentId?: string
  type: 'tree' | 'free'
  level?: number // For tree structure
  tags?: string[] // For free structure
}

const CategoryManagement: React.FC = () => {
  const [structureType, setStructureType] = useState<'tree' | 'free'>('tree')
  const [categories, setCategories] = useState<Category[]>([
    {
      id: '1',
      name: 'Food Products',
      description: 'All food related products',
      type: 'tree',
      level: 0
    },
    {
      id: '2',
      name: 'Dairy',
      description: 'Dairy products',
      parentId: '1',
      type: 'tree',
      level: 1
    },
    {
      id: '3',
      name: 'Storage Conditions',
      description: 'Product storage requirements',
      type: 'free',
      tags: ['Refrigerated', 'Frozen', 'Room Temperature', 'Cool & Dry']
    }
  ])

  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [parentCategory, setParentCategory] = useState<string>('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const newCategory: Category = {
      id: editingCategory?.id || Date.now().toString(),
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      type: structureType,
      tags: structureType === 'free' ? 
        (formData.get('tags') as string).split(',').map(tag => tag.trim()) : 
        undefined
    }

    if (structureType === 'tree') {
      const selectedParentId = formData.get('parentCategory') as string
      if (selectedParentId) {
        newCategory.parentId = selectedParentId
        newCategory.level = (categories.find(c => c.id === selectedParentId)?.level || 0) + 1
      } else {
        newCategory.level = 0
      }
    }

    if (editingCategory) {
      setCategories(categories.map(cat => cat.id === editingCategory.id ? newCategory : cat))
    } else {
      setCategories([...categories, newCategory])
    }

    setShowForm(false)
    setEditingCategory(null)
    setParentCategory('')
    form.reset()
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setStructureType(category.type)
    if (category.parentId) {
      setParentCategory(category.parentId)
    }
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    // Also delete all child categories if it's a tree structure
    const idsToDelete = [id]
    if (structureType === 'tree') {
      const findChildren = (parentId: string) => {
        categories.forEach(cat => {
          if (cat.parentId === parentId) {
            idsToDelete.push(cat.id)
            findChildren(cat.id)
          }
        })
      }
      findChildren(id)
    }
    setCategories(categories.filter(cat => !idsToDelete.includes(cat.id)))
  }

  const getAvailableParents = (editingId?: string) => {
    return categories.filter(cat => 
      cat.type === 'tree' && 
      cat.id !== editingId && 
      (!editingId || !isDescendant(cat.id, editingId))
    )
  }

  const isDescendant = (potentialParentId: string, categoryId: string) => {
    let current = categories.find(c => c.id === categoryId)
    while (current?.parentId) {
      if (current.parentId === potentialParentId) return true
      current = categories.find(c => c.id === current?.parentId)
    }
    return false
  }

  const renderTreeCategories = () => {
    const rootCategories = categories.filter(cat => 
      cat.type === 'tree' && !cat.parentId
    )

    const renderCategory = (category: Category) => {
      const children = categories.filter(cat => 
        cat.type === 'tree' && cat.parentId === category.id
      )

      return (
        <div 
          key={category.id}
          className="border border-[var(--divider)] rounded-lg p-4 mb-4"
          style={{ marginLeft: `${category.level ? category.level * 2 : 0}rem` }}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-medium">{category.name}</h3>
              <p className="text-sm text-[var(--text-secondary)]">
                {category.description}
              </p>
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
          {children.length > 0 && (
            <div className="mt-4 space-y-4">
              {children.map(child => renderCategory(child))}
            </div>
          )}
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {rootCategories.map(category => renderCategory(category))}
      </div>
    )
  }

  const renderFreeCategories = () => {
    return (
      <div className="space-y-4">
        {categories
          .filter(cat => cat.type === 'free')
          .map(category => (
            <div
              key={category.id}
              className="border border-[var(--divider)] rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-medium">{category.name}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {category.description}
                  </p>
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
              {category.tags && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {category.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-sm rounded-full bg-[var(--primary-light)] text-[var(--primary-dark)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold">Category Management</h2>
            <p className="text-[var(--text-secondary)]">
              Manage categories using tree or free structure
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={structureType === 'tree' ? 'primary' : 'outline'}
              icon={<GitBranch size={20} />}
              onClick={() => setStructureType('tree')}
            >
              Tree Structure
            </Button>
            <Button
              variant={structureType === 'free' ? 'primary' : 'outline'}
              icon={<List size={20} />}
              onClick={() => setStructureType('free')}
            >
              Free Structure
            </Button>
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
              {structureType === 'tree' && (
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    Parent Category
                  </label>
                  <select
                    name="parentCategory"
                    className="w-full border border-[var(--divider)] rounded-md p-2"
                    value={parentCategory}
                    onChange={(e) => setParentCategory(e.target.value)}
                  >
                    <option value="">No Parent (Root Category)</option>
                    {getAvailableParents(editingCategory?.id).map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
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
            {structureType === 'free' && (
              <div className="mt-4">
                <Input
                  name="tags"
                  label="Tags (comma-separated)"
                  placeholder="Enter tags separated by commas"
                  defaultValue={editingCategory?.tags?.join(', ')}
                />
              </div>
            )}
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

        {structureType === 'tree' ? renderTreeCategories() : renderFreeCategories()}
      </Card>
    </div>
  )
}

export default CategoryManagement
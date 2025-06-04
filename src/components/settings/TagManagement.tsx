import React, { useState } from 'react'
import { Plus, X, Edit2 } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'

interface Tag {
  id: string
  name: string
  color: string
  type1?: string
  type2?: string
  type3?: string
  type4?: string
}

const TagManagement: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([
    {
      id: '1',
      name: 'Premium',
      color: '#FF4C51',
      type1: 'food',
      type3: 'food',
      type4: 'organic'
    },
    {
      id: '2',
      name: 'Equipment',
      color: '#FF9F43',
      type1: 'non-food',
      type2: 'hardware'
    },
    {
      id: '3',
      name: 'Natural',
      color: '#00BAD1',
      type1: 'food',
      type3: 'personal-care',
      type4: 'organic'
    }
  ])
  const [showForm, setShowForm] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formData = new FormData(form)

    const newTag = {
      id: editingTag?.id || Date.now().toString(),
      name: formData.get('name') as string,
      color: formData.get('color') as string,
      type1: formData.get('type1') as string || undefined,
      type2: formData.get('type2') as string || undefined,
      type3: formData.get('type3') as string || undefined,
      type4: formData.get('type4') as string || undefined
    }

    if (editingTag) {
      setTags(tags.map(tag => tag.id === editingTag.id ? newTag : tag))
    } else {
      setTags([...tags, newTag])
    }

    setShowForm(false)
    setEditingTag(null)
    form.reset()
  }

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    setTags(tags.filter(tag => tag.id !== id))
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold">Tag Management</h2>
            <p className="text-[var(--text-secondary)]">
              Manage tags for products, documents, and complaints
            </p>
          </div>
          <Button
            icon={<Plus size={20} />}
            onClick={() => {
              setEditingTag(null)
              setShowForm(true)
            }}
          >
            Add Tag
          </Button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 p-4 border border-[var(--divider)] rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                name="name"
                label="Tag Name"
                defaultValue={editingTag?.name}
                required
              />
              <Input
                name="color"
                label="Color"
                type="color"
                defaultValue={editingTag?.color || '#7367F0'}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="type1"
                label="Type 1 (e.g., food, non-food)"
                defaultValue={editingTag?.type1}
                placeholder="Enter type"
              />
              <Input
                name="type2"
                label="Type 2 (e.g., hardware, software, other)"
                defaultValue={editingTag?.type2}
                placeholder="Enter type"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Input
                name="type3"
                label="Type 3 (e.g., food, drinks, home-care)"
                defaultValue={editingTag?.type3}
                placeholder="Enter type"
              />
              <Input
                name="type4"
                label="Type 4 (e.g., organic, conventional)"
                defaultValue={editingTag?.type4}
                placeholder="Enter type"
              />
            </div>

            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingTag(null)
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {editingTag ? 'Update Tag' : 'Create Tag'}
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          {tags.map(tag => (
            <div
              key={tag.id}
              className="flex items-center justify-between p-3 border border-[var(--divider)] rounded-lg hover:border-[var(--primary-main)] transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                <div>
                  <span className="font-medium">{tag.name}</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {tag.type1 && (
                      <span className="text-xs bg-[var(--primary-light)] text-[var(--primary-dark)] px-2 py-1 rounded-full">
                        Type 1: {tag.type1}
                      </span>
                    )}
                    {tag.type2 && (
                      <span className="text-xs bg-[var(--info-light)] text-[var(--info-dark)] px-2 py-1 rounded-full">
                        Type 2: {tag.type2}
                      </span>
                    )}
                    {tag.type3 && (
                      <span className="text-xs bg-[var(--warning-light)] text-[var(--warning-dark)] px-2 py-1 rounded-full">
                        Type 3: {tag.type3}
                      </span>
                    )}
                    {tag.type4 && (
                      <span className="text-xs bg-[var(--success-light)] text-[var(--success-dark)] px-2 py-1 rounded-full">
                        Type 4: {tag.type4}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Edit2 size={16} />}
                  onClick={() => handleEdit(tag)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  icon={<X size={16} />}
                  onClick={() => handleDelete(tag.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default TagManagement
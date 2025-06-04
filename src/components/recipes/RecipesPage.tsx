import React, { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import RecipeGrid from './RecipeGrid'
import RecipeFilters from './RecipeFilters'
import RecipeForm from './RecipeForm'

const RecipesPage: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const handleFilterChange = (filters: any) => {
    console.log('Filters changed:', filters)
  }

  const handleFilterReset = () => {
    console.log('Filters reset')
  }

  const handleRecipeSubmit = (data: any) => {
    console.log('Recipe submitted:', data)
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Recipe Management</h1>
          <p className="text-[var(--text-secondary)]">
            Manage your product recipes and formulations
          </p>
        </div>
        <Button 
          icon={<Plus size={20} />}
          onClick={() => setShowForm(true)}
        >
          Add Recipe
        </Button>
      </div>

      {showForm && (
        <Card title="Add New Recipe">
          <RecipeForm onSubmit={handleRecipeSubmit} />
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="w-96">
            <Input
              placeholder="Search recipes..."
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
            <RecipeFilters
              onFilterChange={handleFilterChange}
              onReset={handleFilterReset}
            />
          </div>
        )}

        <RecipeGrid />
      </Card>
    </div>
  )
}

export default RecipesPage
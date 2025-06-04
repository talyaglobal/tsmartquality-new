import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Trash2 } from 'lucide-react'
import Input from '../ui/Input'
import Button from '../ui/Button'

interface Ingredient {
  id: string
  name: string
  percentage: number
}

interface RecipeFormData {
  name: string
  code: string
  category: string
  version: string
  description: string
  productCode: string
  productName: string
  unit: string
  quantity: number
  ingredients: Ingredient[]
  instructions: string
  specifications: string
  notes: string
}

interface RecipeFormProps {
  onSubmit: (data: RecipeFormData) => void
  initialData?: Partial<RecipeFormData>
}

const RecipeForm: React.FC<RecipeFormProps> = ({ onSubmit, initialData }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>(initialData?.ingredients || [])
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RecipeFormData>({
    defaultValues: {
      ...initialData,
      ingredients: initialData?.ingredients || []
    }
  })

  const handleAddIngredient = () => {
    setIngredients([
      ...ingredients,
      { id: Date.now().toString(), name: '', percentage: 0 }
    ])
  }

  const handleRemoveIngredient = (id: string) => {
    setIngredients(ingredients.filter(ing => ing.id !== id))
  }

  const handleIngredientChange = (id: string, field: 'name' | 'percentage', value: string) => {
    setIngredients(ingredients.map(ing => {
      if (ing.id === id) {
        return { ...ing, [field]: field === 'percentage' ? parseFloat(value) || 0 : value }
      }
      return ing
    }))
  }

  const totalPercentage = ingredients.reduce((sum, ing) => sum + ing.percentage, 0)

  const handleFormSubmit = (data: RecipeFormData) => {
    onSubmit({
      ...data,
      ingredients
    })
  }

  // Sample product data - replace with actual data from your API
  const products = [
    { code: 'PRD001', name: 'Premium Dark Chocolate', unit: 'kg' },
    { code: 'PRD002', name: 'Milk Chocolate', unit: 'kg' },
    { code: 'PRD003', name: 'White Chocolate', unit: 'kg' }
  ]

  const selectedProductCode = watch('productCode')
  const selectedProduct = products.find(p => p.code === selectedProductCode)

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Recipe Name"
          error={errors.name?.message}
          {...register('name', { required: 'Recipe name is required' })}
        />
        <Input
          label="Recipe Code"
          error={errors.code?.message}
          {...register('code', { required: 'Recipe code is required' })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Category"
          error={errors.category?.message}
          {...register('category', { required: 'Category is required' })}
        />
        <Input
          label="Version"
          error={errors.version?.message}
          {...register('version', { required: 'Version is required' })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Product
          </label>
          <select
            className="w-full border border-[var(--divider)] rounded-md p-2"
            {...register('productCode', { required: 'Product is required' })}
          >
            <option value="">Select Product</option>
            {products.map(product => (
              <option key={product.code} value={product.code}>
                {product.name} ({product.code})
              </option>
            ))}
          </select>
          {errors.productCode && (
            <p className="mt-1 text-sm text-[var(--error-main)]">{errors.productCode.message}</p>
          )}
        </div>
        <Input
          label="Unit"
          value={selectedProduct?.unit || ''}
          disabled
          {...register('unit')}
        />
        <Input
          label="Quantity"
          type="number"
          error={errors.quantity?.message}
          {...register('quantity', { required: 'Quantity is required' })}
        />
      </div>

      <Input
        label="Description"
        multiline
        rows={3}
        error={errors.description?.message}
        {...register('description', { required: 'Description is required' })}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Ingredients</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={<Plus size={16} />}
            onClick={handleAddIngredient}
          >
            Add Ingredient
          </Button>
        </div>

        <div className="border border-[var(--divider)] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-[var(--background-paper)]">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-[var(--text-secondary)]">
                  Ingredient Name
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-[var(--text-secondary)]">
                  Percentage (%)
                </th>
                <th className="px-4 py-2 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {ingredients.map((ingredient) => (
                <tr key={ingredient.id} className="border-t border-[var(--divider)]">
                  <td className="px-4 py-2">
                    <Input
                      value={ingredient.name}
                      onChange={(e) => handleIngredientChange(ingredient.id, 'name', e.target.value)}
                      placeholder="Enter ingredient name"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <Input
                      type="number"
                      value={ingredient.percentage}
                      onChange={(e) => handleIngredientChange(ingredient.id, 'percentage', e.target.value)}
                      placeholder="Enter percentage"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      icon={<Trash2 size={16} />}
                      onClick={() => handleRemoveIngredient(ingredient.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-[var(--background-paper)]">
              <tr>
                <td className="px-4 py-2 font-medium">Total</td>
                <td className="px-4 py-2">
                  <span className={totalPercentage === 100 ? 'text-[var(--success-main)]' : 'text-[var(--error-main)]'}>
                    {totalPercentage}%
                  </span>
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
        {totalPercentage !== 100 && (
          <p className="text-sm text-[var(--error-main)]">
            Total percentage must equal 100%
          </p>
        )}
      </div>

      <Input
        label="Instructions"
        multiline
        rows={4}
        error={errors.instructions?.message}
        {...register('instructions', { required: 'Instructions are required' })}
      />

      <Input
        label="Specifications"
        multiline
        rows={3}
        error={errors.specifications?.message}
        {...register('specifications', { required: 'Specifications are required' })}
      />

      <Input
        label="Notes"
        multiline
        rows={3}
        error={errors.notes?.message}
        {...register('notes')}
      />

      <div className="flex justify-end space-x-2">
        <Button variant="outline" type="button">
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={totalPercentage !== 100}
        >
          Save Recipe
        </Button>
      </div>
    </form>
  )
}

export default RecipeForm
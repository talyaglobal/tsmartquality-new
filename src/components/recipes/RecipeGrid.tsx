import React from 'react'
import { Edit, Trash2, Eye, FileText } from 'lucide-react'
import Button from '../ui/Button'

interface Recipe {
  id: string
  name: string
  code: string
  category: string
  version: string
  lastUpdated: string
  status: string
}

const RecipeGrid: React.FC = () => {
  const recipes: Recipe[] = [
    {
      id: '1',
      name: 'Premium Dark Chocolate',
      code: 'RCP001',
      category: 'Chocolate',
      version: '2.1',
      lastUpdated: '2024-03-15',
      status: 'Active',
    },
    {
      id: '2',
      name: 'Milk Chocolate with Almonds',
      code: 'RCP002',
      category: 'Chocolate',
      version: '1.3',
      lastUpdated: '2024-03-10',
      status: 'Under Review',
    },
  ]

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-[var(--divider)]">
        <thead className="bg-[var(--background-paper)]">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Recipe Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Version
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Last Updated
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-[var(--background-paper)] divide-y divide-[var(--divider)]">
          {recipes.map((recipe) => (
            <tr key={recipe.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium">{recipe.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm">{recipe.code}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm">{recipe.category}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm">{recipe.version}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {recipe.lastUpdated}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${recipe.status === 'Active' ? 'bg-[var(--success-light)] text-[var(--success-dark)]' : 
                    'bg-[var(--warning-light)] text-[var(--warning-dark)]'}`}>
                  {recipe.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" icon={<Eye size={16} />}>
                    View
                  </Button>
                  <Button variant="outline" size="sm" icon={<FileText size={16} />}>
                    Specs
                  </Button>
                  <Button variant="outline" size="sm" icon={<Edit size={16} />}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" icon={<Trash2 size={16} />}>
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default RecipeGrid
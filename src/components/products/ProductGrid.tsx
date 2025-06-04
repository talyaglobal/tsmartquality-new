import React from 'react'
import { Table } from '@tanstack/react-table'
import { Edit, Trash2, Eye } from 'lucide-react'
import Button from '../ui/Button'

interface Product {
  id: string
  name: string
  code: string
  status: string
  lastUpdated: string
}

const ProductGrid: React.FC = () => {
  const products: Product[] = [
    {
      id: '1',
      name: 'Product A',
      code: 'PRD001',
      status: 'Active',
      lastUpdated: '2024-03-10',
    },
    // Add more sample products here
  ]

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-[var(--divider)]">
        <thead className="bg-[var(--background-paper)]">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Product Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Last Updated
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-[var(--background-paper)] divide-y divide-[var(--divider)]">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium">{product.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm">{product.code}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[var(--success-light)] text-[var(--success-dark)]">
                  {product.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {product.lastUpdated}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" icon={<Eye size={16} />}>
                    View
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

export default ProductGrid
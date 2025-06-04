import React, { useState } from 'react'
import { Search, Plus, Filter, Download, Upload } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'

interface InventoryItem {
  id: string
  sku: string
  name: string
  category: string
  quantity: number
  location: string
  lastUpdated: string
  status: 'In Stock' | 'Low Stock' | 'Out of Stock'
}

const WarehouseInventory: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false)
  
  const inventoryItems: InventoryItem[] = [
    {
      id: '1',
      sku: 'PRD001',
      name: 'Product A',
      category: 'Electronics',
      quantity: 150,
      location: 'Aisle A-12',
      lastUpdated: '2024-03-15',
      status: 'In Stock'
    },
    {
      id: '2',
      sku: 'PRD002',
      name: 'Product B',
      category: 'Furniture',
      quantity: 5,
      location: 'Aisle B-03',
      lastUpdated: '2024-03-14',
      status: 'Low Stock'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Inventory Management</h1>
          <p className="text-[var(--text-secondary)]">
            Track and manage warehouse inventory levels
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" icon={<Upload size={20} />}>
            Import
          </Button>
          <Button variant="outline" icon={<Download size={20} />}>
            Export
          </Button>
          <Button icon={<Plus size={20} />}>
            Add Item
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="w-96">
            <Input
              placeholder="Search inventory..."
              startIcon={<Search size={20} />}
            />
          </div>
          <Button 
            variant="outline"
            icon={<Filter size={20} />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filter
          </Button>
        </div>

        {showFilters && (
          <div className="mb-6 p-4 border border-[var(--divider)] rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Category"
                placeholder="Select category"
              />
              <Input
                label="Location"
                placeholder="Select location"
              />
              <Input
                label="Status"
                placeholder="Select status"
              />
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--divider)]">
            <thead className="bg-[var(--background-paper)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  SKU
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-[var(--background-paper)] divide-y divide-[var(--divider)]">
              {inventoryItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {item.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium">{item.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {item.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {item.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${item.status === 'In Stock' ? 'bg-[var(--success-light)] text-[var(--success-dark)]' : 
                        item.status === 'Low Stock' ? 'bg-[var(--warning-light)] text-[var(--warning-dark)]' :
                        'bg-[var(--error-light)] text-[var(--error-dark)]'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {item.lastUpdated}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

export default WarehouseInventory
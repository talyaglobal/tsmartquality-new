import React from 'react'
import { Package, ArrowUp, ArrowDown } from 'lucide-react'
import Card from '../ui/Card'

const WarehouseStock: React.FC = () => {
  const stockItems = [
    {
      id: 1,
      name: 'Product A',
      quantity: 150,
      trend: 'up',
      change: '+12%',
      reorderPoint: 50,
      location: 'Aisle A-1'
    },
    {
      id: 2,
      name: 'Product B',
      quantity: 85,
      trend: 'down',
      change: '-8%',
      reorderPoint: 100,
      location: 'Aisle B-3'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Warehouse Stock</h1>
        <p className="text-[var(--text-secondary)]">
          Monitor stock levels and inventory movements
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stockItems.map((item) => (
          <Card key={item.id}>
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-[var(--primary-main)] bg-opacity-10 mr-3">
                  <Package className="text-[var(--primary-main)]" size={24} />
                </div>
                <div>
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Location: {item.location}
                  </p>
                </div>
              </div>
              <div className={`flex items-center ${
                item.trend === 'up' ? 'text-[var(--success-main)]' : 'text-[var(--error-main)]'
              }`}>
                {item.trend === 'up' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                <span className="text-sm ml-1">{item.change}</span>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm text-[var(--text-secondary)]">Quantity</span>
                <span className="font-medium">{item.quantity} units</span>
              </div>
              <div className="w-full bg-[var(--background-default)] rounded-full h-2">
                <div
                  className="bg-[var(--primary-main)] h-2 rounded-full"
                  style={{ width: `${(item.quantity / 200) * 100}%` }}
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--divider)]">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--text-secondary)]">Reorder Point</span>
                <span className="font-medium">{item.reorderPoint} units</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default WarehouseStock
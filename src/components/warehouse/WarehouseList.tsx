import React from 'react'
import { Package, MapPin } from 'lucide-react'

interface WarehouseListProps {
  country: string
  state: string
  city: string
}

interface Warehouse {
  id: string
  name: string
  address: string
  capacity: number
  utilization: number
}

const WarehouseList: React.FC<WarehouseListProps> = ({ country, state, city }) => {
  // Sample data - replace with actual data from your API
  const warehouses: Warehouse[] = [
    {
      id: '1',
      name: 'Central Distribution Center',
      address: '123 Main St, Los Angeles, CA',
      capacity: 10000,
      utilization: 75
    },
    {
      id: '2',
      name: 'North Fulfillment Center',
      address: '456 Oak Ave, San Francisco, CA',
      capacity: 8000,
      utilization: 60
    }
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-4">Warehouses</h3>
      {warehouses.map(warehouse => (
        <div
          key={warehouse.id}
          className="border border-[var(--divider)] rounded-lg p-4 hover:border-[var(--primary-main)] transition-colors"
        >
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium">{warehouse.name}</h4>
              <div className="flex items-center text-sm text-[var(--text-secondary)] mt-1">
                <MapPin size={16} className="mr-1" />
                {warehouse.address}
              </div>
            </div>
            <Package className="text-[var(--primary-main)]" />
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Capacity Utilization</span>
              <span>{warehouse.utilization}%</span>
            </div>
            <div className="w-full bg-[var(--divider)] rounded-full h-2">
              <div
                className="h-2 rounded-full bg-[var(--primary-main)]"
                style={{ width: `${warehouse.utilization}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default WarehouseList
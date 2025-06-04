import React, { useState } from 'react'
import { Plus, Search, Grid, Box } from 'lucide-react'
import Card from '../../ui/Card'
import Button from '../../ui/Button'
import Input from '../../ui/Input'

interface Shelf {
  id: string
  code: string
  zone: string
  aisle: string
  level: number
  position: string
  capacity: number
  utilization: number
  status: 'available' | 'full' | 'maintenance'
  lastInspection: string
}

interface WarehouseLocation {
  id: string
  name: string
  code: string
  type: string
}

const ShelvesPage: React.FC = () => {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('')

  // Sample data - replace with actual data from your API
  const warehouses: WarehouseLocation[] = [
    {
      id: '1',
      name: 'Main Distribution Center',
      code: 'DC-001',
      type: 'distribution'
    },
    {
      id: '2',
      name: 'East Coast Fulfillment',
      code: 'FC-002',
      type: 'fulfillment'
    }
  ]

  const shelves: Shelf[] = [
    {
      id: '1',
      code: 'A-01-01-01',
      zone: 'A',
      aisle: '01',
      level: 1,
      position: '01',
      capacity: 1000,
      utilization: 75,
      status: 'available',
      lastInspection: '2024-03-15'
    },
    {
      id: '2',
      code: 'A-01-01-02',
      zone: 'A',
      aisle: '01',
      level: 1,
      position: '02',
      capacity: 1000,
      utilization: 100,
      status: 'full',
      lastInspection: '2024-03-15'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-[var(--success-light)] text-[var(--success-dark)]'
      case 'full':
        return 'bg-[var(--warning-light)] text-[var(--warning-dark)]'
      case 'maintenance':
        return 'bg-[var(--error-light)] text-[var(--error-dark)]'
      default:
        return 'bg-[var(--info-light)] text-[var(--info-dark)]'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Shelves Management</h1>
          <p className="text-[var(--text-secondary)]">
            Manage warehouse shelves and storage locations
          </p>
        </div>
        <Button 
          icon={<Plus size={20} />}
        >
          Add Shelf
        </Button>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 max-w-md">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Select Warehouse
            </label>
            <select
              className="w-full border border-[var(--divider)] rounded-md p-2"
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
            >
              <option value="">Select a warehouse</option>
              {warehouses.map(warehouse => (
                <option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name} ({warehouse.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedWarehouse && (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="w-96">
                <Input
                  placeholder="Search shelves..."
                  startIcon={<Search size={20} />}
                />
              </div>
              <div className="flex space-x-2">
                <select className="border border-[var(--divider)] rounded-md px-3 py-2">
                  <option value="">All Zones</option>
                  <option value="A">Zone A</option>
                  <option value="B">Zone B</option>
                  <option value="C">Zone C</option>
                </select>
                <select className="border border-[var(--divider)] rounded-md px-3 py-2">
                  <option value="">All Status</option>
                  <option value="available">Available</option>
                  <option value="full">Full</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--divider)]">
                <thead className="bg-[var(--background-paper)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                      Shelf Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                      Utilization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                      Last Inspection
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[var(--background-paper)] divide-y divide-[var(--divider)]">
                  {shelves.map((shelf) => (
                    <tr key={shelf.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">{shelf.code}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          Zone {shelf.zone}, Aisle {shelf.aisle}, Level {shelf.level}, Pos {shelf.position}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{shelf.capacity} units</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="w-full bg-[var(--divider)] rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                shelf.utilization >= 90 ? 'bg-[var(--error-main)]' :
                                shelf.utilization >= 75 ? 'bg-[var(--warning-main)]' :
                                'bg-[var(--success-main)]'
                              }`}
                              style={{ width: `${shelf.utilization}%` }}
                            />
                          </div>
                          <span className="text-sm text-[var(--text-secondary)]">
                            {shelf.utilization}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(shelf.status)}`}>
                          {shelf.status.charAt(0).toUpperCase() + shelf.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{shelf.lastInspection}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Grid size={16} />}
                        >
                          View Items
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

export default ShelvesPage
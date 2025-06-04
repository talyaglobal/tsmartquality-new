import React, { useState } from 'react'
import { Plus, Search, MapPin } from 'lucide-react'
import Card from '../../ui/Card'
import Button from '../../ui/Button'
import Input from '../../ui/Input'
import LocationMap from './LocationMap'
import LocationForm from './LocationForm'

interface Warehouse {
  id: string
  name: string
  code: string
  type: string
  address: string
  city: string
  state: string
  country: string
  latitude: number
  longitude: number
  capacity: number
  utilization: number
  manager: string
}

const LocationsPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<string>()

  // Sample data - replace with actual data from your API
  const warehouses: Warehouse[] = [
    {
      id: '1',
      name: 'Main Distribution Center',
      code: 'DC-001',
      type: 'distribution',
      address: '123 Warehouse Ave',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      latitude: 34.0522,
      longitude: -118.2437,
      capacity: 50000,
      utilization: 75,
      manager: 'John Smith'
    },
    {
      id: '2',
      name: 'East Coast Fulfillment',
      code: 'FC-002',
      type: 'fulfillment',
      address: '456 Storage Blvd',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      latitude: 40.7128,
      longitude: -74.0060,
      capacity: 35000,
      utilization: 60,
      manager: 'Sarah Johnson'
    }
  ]

  const handleLocationSubmit = (data: any) => {
    console.log('Location submitted:', data)
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Warehouse Locations</h1>
          <p className="text-[var(--text-secondary)]">
            Manage your warehouse and distribution center locations
          </p>
        </div>
        <Button 
          icon={<Plus size={20} />}
          onClick={() => setShowForm(true)}
        >
          Add Location
        </Button>
      </div>

      {showForm ? (
        <Card title="Add New Location">
          <LocationForm 
            onSubmit={handleLocationSubmit}
            onCancel={() => setShowForm(false)}
          />
        </Card>
      ) : (
        <>
          <Card>
            <div className="mb-6">
              <LocationMap
                locations={warehouses}
                selectedLocation={selectedLocation}
                onLocationSelect={setSelectedLocation}
              />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-6">
              <div className="w-96">
                <Input
                  placeholder="Search locations..."
                  startIcon={<Search size={20} />}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {warehouses.map(warehouse => (
                <div
                  key={warehouse.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors
                    ${selectedLocation === warehouse.id
                      ? 'border-[var(--primary-main)] bg-[var(--primary-main)] bg-opacity-5'
                      : 'border-[var(--divider)] hover:border-[var(--primary-main)]'
                    }`}
                  onClick={() => setSelectedLocation(warehouse.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{warehouse.name}</h3>
                      <p className="text-sm text-[var(--text-secondary)]">Code: {warehouse.code}</p>
                    </div>
                    <MapPin className="text-[var(--primary-main)]" />
                  </div>

                  <div className="mt-4 space-y-2">
                    <p className="text-sm">
                      {warehouse.address}, {warehouse.city}, {warehouse.state}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Manager: {warehouse.manager}
                    </p>
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
          </Card>
        </>
      )}
    </div>
  )
}

export default LocationsPage
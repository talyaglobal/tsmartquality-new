import React, { useState } from 'react'
import { MapPin, Search } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import LocationSelector from './LocationSelector'
import WarehouseList from './WarehouseList'

const WarehousePage: React.FC = () => {
  const [selectedCountry, setSelectedCountry] = useState('USA')
  const [selectedState, setSelectedState] = useState('')
  const [selectedCity, setSelectedCity] = useState('')

  const handleLocationChange = (country: string, state: string, city: string) => {
    setSelectedCountry(country)
    setSelectedState(state)
    setSelectedCity(city)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Warehouse Management</h1>
          <p className="text-[var(--text-secondary)]">
            Manage warehouse locations and inventory across regions
          </p>
        </div>
        <Button icon={<MapPin size={20} />}>
          Add Location
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <LocationSelector
              selectedCountry={selectedCountry}
              selectedState={selectedState}
              selectedCity={selectedCity}
              onLocationChange={handleLocationChange}
            />
          </Card>
        </div>

        <div>
          <Card>
            <div className="mb-4">
              <Input
                placeholder="Search warehouses..."
                startIcon={<Search size={20} />}
              />
            </div>
            <WarehouseList
              country={selectedCountry}
              state={selectedState}
              city={selectedCity}
            />
          </Card>
        </div>
      </div>
    </div>
  )
}

export default WarehousePage
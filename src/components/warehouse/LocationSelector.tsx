import React from 'react'
import { MapPin } from 'lucide-react'

interface LocationSelectorProps {
  selectedCountry: string
  selectedState: string
  selectedCity: string
  onLocationChange: (country: string, state: string, city: string) => void
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedCountry,
  selectedState,
  selectedCity,
  onLocationChange
}) => {
  // Sample data - replace with actual data from your API
  const states = [
    { code: 'CA', name: 'California' },
    { code: 'NY', name: 'New York' },
    { code: 'TX', name: 'Texas' },
    { code: 'FL', name: 'Florida' }
  ]

  const cities = {
    CA: ['Los Angeles', 'San Francisco', 'San Diego'],
    NY: ['New York City', 'Buffalo', 'Albany'],
    TX: ['Houston', 'Austin', 'Dallas'],
    FL: ['Miami', 'Orlando', 'Tampa']
  }

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Select Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Country
            </label>
            <select
              className="w-full border border-[var(--divider)] rounded-md p-2"
              value={selectedCountry}
              onChange={(e) => onLocationChange(e.target.value, '', '')}
            >
              <option value="USA">United States</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              State
            </label>
            <select
              className="w-full border border-[var(--divider)] rounded-md p-2"
              value={selectedState}
              onChange={(e) => onLocationChange(selectedCountry, e.target.value, '')}
            >
              <option value="">Select State</option>
              {states.map(state => (
                <option key={state.code} value={state.code}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              City
            </label>
            <select
              className="w-full border border-[var(--divider)] rounded-md p-2"
              value={selectedCity}
              onChange={(e) => onLocationChange(selectedCountry, selectedState, e.target.value)}
              disabled={!selectedState}
            >
              <option value="">Select City</option>
              {selectedState && cities[selectedState as keyof typeof cities].map(city => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="relative h-[400px] bg-[var(--background-default)] rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="https://images.pexels.com/photos/4481259/pexels-photo-4481259.jpeg"
            alt="USA Map"
            className="w-full h-full object-cover"
          />
          {selectedState && selectedCity && (
            <div className="absolute">
              <div className="bg-[var(--primary-main)] text-white px-3 py-1 rounded-lg shadow-lg flex items-center">
                <MapPin size={16} className="mr-1" />
                <span>{selectedCity}, {selectedState}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LocationSelector
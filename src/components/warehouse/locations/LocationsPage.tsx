import React, { useState } from 'react';
import { Plus, Search, MapPin, Building2, ArrowUpDown } from 'lucide-react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import LocationForm from './LocationForm';
import LocationMap from './LocationMap';

interface Location {
  id: string;
  name: string;
  code: string;
  type: string;
  address: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  capacity: number;
  utilization: number;
  manager: string;
  status: 'active' | 'inactive' | 'maintenance';
}

const LocationsPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  // Sample data - replace with actual data from your API
  const locations: Location[] = [
    {
      id: '1',
      name: 'Main Distribution Center',
      code: 'DC-001',
      type: 'Distribution Center',
      address: '123 Warehouse Ave',
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      latitude: 34.0522,
      longitude: -118.2437,
      capacity: 50000,
      utilization: 75,
      manager: 'John Smith',
      status: 'active'
    },
    {
      id: '2',
      name: 'East Coast Fulfillment',
      code: 'FC-002',
      type: 'Fulfillment Center',
      address: '456 Storage Blvd',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      latitude: 40.7128,
      longitude: -74.0060,
      capacity: 35000,
      utilization: 60,
      manager: 'Sarah Johnson',
      status: 'active'
    }
  ];

  const handleLocationSubmit = (data: any) => {
    console.log('Location submitted:', data);
    setShowForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-[var(--success-light)] text-[var(--success-dark)]';
      case 'inactive':
        return 'bg-[var(--error-light)] text-[var(--error-dark)]';
      case 'maintenance':
        return 'bg-[var(--warning-light)] text-[var(--warning-dark)]';
      default:
        return 'bg-[var(--info-light)] text-[var(--info-dark)]';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Locations</h1>
          <p className="text-[var(--text-secondary)]">
            Manage warehouse and distribution center locations
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            icon={viewMode === 'map' ? <Building2 size={20} /> : <MapPin size={20} />}
            onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
          >
            {viewMode === 'map' ? 'List View' : 'Map View'}
          </Button>
          <Button 
            icon={<Plus size={20} />}
            onClick={() => setShowForm(true)}
          >
            Add Location
          </Button>
        </div>
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
            <div className="flex items-center justify-between mb-6">
              <div className="w-96">
                <Input
                  placeholder="Search locations..."
                  startIcon={<Search size={20} />}
                />
              </div>
              <div className="flex space-x-2">
                <select className="border border-[var(--divider)] rounded-md px-3 py-2">
                  <option value="">All Types</option>
                  <option value="distribution">Distribution Center</option>
                  <option value="fulfillment">Fulfillment Center</option>
                  <option value="warehouse">Warehouse</option>
                </select>
                <select className="border border-[var(--divider)] rounded-md px-3 py-2">
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
                <Button variant="outline" icon={<ArrowUpDown size={20} />}>
                  Sort
                </Button>
              </div>
            </div>

            {viewMode === 'map' ? (
              <div className="mb-6">
                <LocationMap
                  locations={locations}
                  selectedLocation={selectedLocation}
                  onLocationSelect={setSelectedLocation}
                />
              </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {locations.map(location => (
                <div
                  key={location.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors
                    ${selectedLocation === location.id
                      ? 'border-[var(--primary-main)] bg-[var(--primary-main)] bg-opacity-5'
                      : 'border-[var(--divider)] hover:border-[var(--primary-main)]'
                    }`}
                  onClick={() => setSelectedLocation(location.id)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{location.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(location.status)}`}>
                          {location.status.charAt(0).toUpperCase() + location.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)]">Code: {location.code}</p>
                    </div>
                    <MapPin className="text-[var(--primary-main)]" />
                  </div>

                  <div className="mt-4 space-y-2">
                    <p className="text-sm">
                      {location.address}, {location.city}, {location.state}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Manager: {location.manager}
                    </p>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Type: {location.type}
                    </p>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Capacity Utilization</span>
                      <span>{location.utilization}%</span>
                    </div>
                    <div className="w-full bg-[var(--divider)] rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          location.utilization > 90 ? 'bg-[var(--error-main)]' :
                          location.utilization > 75 ? 'bg-[var(--warning-main)]' :
                          'bg-[var(--success-main)]'
                        }`}
                        style={{ width: `${location.utilization}%` }}
                      />
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">
                      {location.capacity.toLocaleString()} sq ft total capacity
                    </p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-[var(--divider)] flex justify-between items-center">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm">
                      Manage Stock
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default LocationsPage;
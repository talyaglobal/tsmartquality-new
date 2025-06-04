import React, { useState } from 'react';
import { Plus, Search, Grid, Box } from 'lucide-react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import ShelvesGrid from './ShelvesGrid';
import ShelvesFilters from './ShelvesFilters';

const ShelvesPage: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');

  // Sample data - replace with actual data from your API
  const warehouses = [
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
  ];

  const handleFilterChange = (filters: any) => {
    console.log('Filters changed:', filters);
  };

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
                <Button variant="outline">Export</Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  Filter
                </Button>
              </div>
            </div>

            {showFilters && (
              <div className="mb-6">
                <ShelvesFilters onFilterChange={handleFilterChange} />
              </div>
            )}

            <ShelvesGrid />
          </>
        )}
      </Card>
    </div>
  );
};

export default ShelvesPage;
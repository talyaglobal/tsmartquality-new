import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import CustomerGrid from './CustomerGrid';
import CustomerFilters from './CustomerFilters';
import CustomerForm from './CustomerForm';
import FilterBadges from '../ui/FilterBadges';

const CustomersPage: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const filterBadges = [
    { id: 'cash-cow', label: 'Cash Cows', count: 12, color: 'success' },
    { id: 'star', label: 'Stars', count: 8, color: 'warning' },
    { id: 'problem-child', label: 'Problem Children', count: 5, color: 'error' },
    { id: 'dog', label: 'Dogs', count: 3, color: 'info' },
    { id: 'strategic', label: 'Strategic Accounts', count: 15, color: 'primary' }
  ];

  const handleFilterChange = (filters: any) => {
    console.log('Filters changed:', filters);
  };

  const handleFilterReset = () => {
    console.log('Filters reset');
  };

  const handleCustomerSubmit = (data: any) => {
    console.log('Customer submitted:', data);
    setShowForm(false);
  };

  const handleClearBadge = (id: string) => {
    console.log('Clear badge:', id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Customers</h1>
          <p className="text-[var(--text-secondary)]">
            Manage your customer relationships and strategic accounts
          </p>
        </div>
        <Button 
          icon={<Plus size={20} />}
          onClick={() => setShowForm(true)}
        >
          Add Customer
        </Button>
      </div>

      {showForm && (
        <Card title="Add New Customer">
          <CustomerForm onSubmit={handleCustomerSubmit} />
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="w-96">
            <Input
              placeholder="Search customers..."
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

        <FilterBadges badges={filterBadges} onClear={handleClearBadge} />

        {showFilters && (
          <div className="mb-6">
            <CustomerFilters
              onFilterChange={handleFilterChange}
              onReset={handleFilterReset}
            />
          </div>
        )}

        <CustomerGrid />
      </Card>
    </div>
  );
};

export default CustomersPage;
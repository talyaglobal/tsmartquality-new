import React, { useState } from 'react';
import { Search, Plus, Filter, Download, FileText, Clock, Tag, User, Calendar, Clipboard } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface BuyingSpec {
  id: string;
  title: string;
  materialCode: string;
  version: string;
  status: 'active' | 'draft' | 'archived';
  lastUpdated: string;
  updatedBy: string;
  supplier: string;
  category: string;
  tags: string[];
}

const BuyingSpecsPage: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);

  // Sample data - replace with actual data from your API
  const buyingSpecs: BuyingSpec[] = [
    {
      id: '1',
      title: 'Organic Cocoa Beans Specification',
      materialCode: 'RAW001',
      version: '2.3',
      status: 'active',
      lastUpdated: '2024-03-15',
      updatedBy: 'John Smith',
      supplier: 'Organic Farms Ltd',
      category: 'Raw Materials',
      tags: ['Cocoa', 'Organic', 'Fair Trade']
    },
    {
      id: '2',
      title: 'Cane Sugar Specification',
      materialCode: 'RAW002',
      version: '1.5',
      status: 'active',
      lastUpdated: '2024-02-20',
      updatedBy: 'Sarah Johnson',
      supplier: 'Sweet Ingredients Co.',
      category: 'Raw Materials',
      tags: ['Sugar', 'Sweetener']
    },
    {
      id: '3',
      title: 'Milk Powder Specification',
      materialCode: 'RAW003',
      version: '3.1',
      status: 'draft',
      lastUpdated: '2024-03-10',
      updatedBy: 'Michael Brown',
      supplier: 'Dairy Products Inc.',
      category: 'Raw Materials',
      tags: ['Dairy', 'Powder']
    },
    {
      id: '4',
      title: 'Cardboard Packaging Specification',
      materialCode: 'PKG001',
      version: '1.2',
      status: 'active',
      lastUpdated: '2024-01-15',
      updatedBy: 'Emily Davis',
      supplier: 'Packaging Solutions',
      category: 'Packaging',
      tags: ['Cardboard', 'Recyclable']
    },
    {
      id: '5',
      title: 'Vanilla Extract Specification',
      materialCode: 'RAW004',
      version: '2.0',
      status: 'archived',
      lastUpdated: '2023-12-05',
      updatedBy: 'John Smith',
      supplier: 'Flavor Essentials',
      category: 'Raw Materials',
      tags: ['Flavor', 'Extract']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-[var(--success-light)] text-[var(--success-dark)]';
      case 'draft':
        return 'bg-[var(--warning-light)] text-[var(--warning-dark)]';
      case 'archived':
        return 'bg-[var(--error-light)] text-[var(--error-dark)]';
      default:
        return 'bg-[var(--info-light)] text-[var(--info-dark)]';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Buying Specifications</h1>
          <p className="text-[var(--text-secondary)]">
            Manage specifications for raw materials and supplies
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            icon={<Download size={20} />}
          >
            Export
          </Button>
          <Button 
            icon={<Plus size={20} />}
          >
            Add Specification
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="w-96">
            <Input
              placeholder="Search specifications..."
              startIcon={<Search size={20} />}
            />
          </div>
          <div className="flex space-x-2">
            <select className="border border-[var(--divider)] rounded-md px-3 py-2">
              <option value="">All Categories</option>
              <option value="raw">Raw Materials</option>
              <option value="packaging">Packaging</option>
              <option value="ingredients">Ingredients</option>
              <option value="additives">Additives</option>
            </select>
            <Button 
              variant="outline"
              icon={<Filter size={20} />}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filter
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="mb-6 p-4 border border-[var(--divider)] rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Status
                </label>
                <select className="w-full border border-[var(--divider)] rounded-md p-2">
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Supplier
                </label>
                <select className="w-full border border-[var(--divider)] rounded-md p-2">
                  <option value="">All Suppliers</option>
                  <option value="organic">Organic Farms Ltd</option>
                  <option value="sweet">Sweet Ingredients Co.</option>
                  <option value="dairy">Dairy Products Inc.</option>
                  <option value="packaging">Packaging Solutions</option>
                  <option value="flavor">Flavor Essentials</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Last Updated
                </label>
                <select className="w-full border border-[var(--divider)] rounded-md p-2">
                  <option value="">Any Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {buyingSpecs.map((spec) => (
            <div
              key={spec.id}
              className="p-4 border border-[var(--divider)] rounded-lg hover:border-[var(--primary-main)] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-2 rounded-lg bg-[var(--info-light)] text-[var(--info-dark)]">
                    <Clipboard size={24} />
                  </div>
                  <div>
                    <h3 className="font-medium">{spec.title}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-[var(--text-secondary)]">
                        Material Code: {spec.materialCode}
                      </span>
                      <span className="text-sm text-[var(--text-secondary)]">
                        Version: {spec.version}
                      </span>
                      <span className="text-sm text-[var(--text-secondary)]">
                        Supplier: {spec.supplier}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {spec.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs rounded-full bg-[var(--primary-light)] text-[var(--primary-dark)]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(spec.status)}`}>
                    {spec.status.charAt(0).toUpperCase() + spec.status.slice(1)}
                  </span>
                  <div className="flex items-center text-sm text-[var(--text-secondary)] mt-2">
                    <Calendar size={14} className="mr-1" />
                    {spec.lastUpdated}
                  </div>
                  <div className="flex items-center text-sm text-[var(--text-secondary)] mt-1">
                    <User size={14} className="mr-1" />
                    {spec.updatedBy}
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-4 space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<FileText size={16} />}
                >
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Download size={16} />}
                >
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default BuyingSpecsPage;
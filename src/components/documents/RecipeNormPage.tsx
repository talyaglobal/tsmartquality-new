import React, { useState } from 'react';
import { Search, Plus, Filter, Download, FileText, Clock, Tag, User, Calendar, FileSpreadsheet, Percent } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface RecipeNorm {
  id: string;
  title: string;
  recipeCode: string;
  version: string;
  status: 'active' | 'draft' | 'archived';
  lastUpdated: string;
  updatedBy: string;
  productCode: string;
  yield: string;
  tags: string[];
}

const RecipeNormPage: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);

  // Sample data - replace with actual data from your API
  const recipeNorms: RecipeNorm[] = [
    {
      id: '1',
      title: 'Premium Dark Chocolate Recipe',
      recipeCode: 'RCP001',
      version: '2.3',
      status: 'active',
      lastUpdated: '2024-03-15',
      updatedBy: 'John Smith',
      productCode: 'PRD001',
      yield: '100 kg',
      tags: ['Chocolate', 'Premium', 'Dark']
    },
    {
      id: '2',
      title: 'Milk Chocolate with Almonds Recipe',
      recipeCode: 'RCP002',
      version: '1.5',
      status: 'active',
      lastUpdated: '2024-02-20',
      updatedBy: 'Sarah Johnson',
      productCode: 'PRD002',
      yield: '80 kg',
      tags: ['Chocolate', 'Milk', 'Nuts']
    },
    {
      id: '3',
      title: 'Organic Dark Chocolate Recipe',
      recipeCode: 'RCP003',
      version: '3.1',
      status: 'draft',
      lastUpdated: '2024-03-10',
      updatedBy: 'Michael Brown',
      productCode: 'PRD003',
      yield: '90 kg',
      tags: ['Chocolate', 'Organic', 'Dark']
    },
    {
      id: '4',
      title: 'White Chocolate Recipe',
      recipeCode: 'RCP004',
      version: '1.2',
      status: 'active',
      lastUpdated: '2024-01-15',
      updatedBy: 'Emily Davis',
      productCode: 'PRD004',
      yield: '75 kg',
      tags: ['Chocolate', 'White']
    },
    {
      id: '5',
      title: 'Chocolate Truffles Recipe',
      recipeCode: 'RCP005',
      version: '2.0',
      status: 'archived',
      lastUpdated: '2023-12-05',
      updatedBy: 'John Smith',
      productCode: 'PRD005',
      yield: '50 kg',
      tags: ['Chocolate', 'Truffles', 'Specialty']
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
          <h1 className="text-2xl font-bold mb-1">Recipe & Norm</h1>
          <p className="text-[var(--text-secondary)]">
            Manage product recipes and manufacturing norms
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
            Add Recipe
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="w-96">
            <Input
              placeholder="Search recipes..."
              startIcon={<Search size={20} />}
            />
          </div>
          <div className="flex space-x-2">
            <select className="border border-[var(--divider)] rounded-md px-3 py-2">
              <option value="">All Products</option>
              <option value="chocolate">Chocolate Products</option>
              <option value="confectionery">Confectionery</option>
              <option value="baked">Baked Goods</option>
              <option value="specialty">Specialty Items</option>
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
                  Recipe Type
                </label>
                <select className="w-full border border-[var(--divider)] rounded-md p-2">
                  <option value="">All Types</option>
                  <option value="standard">Standard</option>
                  <option value="premium">Premium</option>
                  <option value="organic">Organic</option>
                  <option value="specialty">Specialty</option>
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
          {recipeNorms.map((recipe) => (
            <div
              key={recipe.id}
              className="p-4 border border-[var(--divider)] rounded-lg hover:border-[var(--primary-main)] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-2 rounded-lg bg-[var(--warning-light)] text-[var(--warning-dark)]">
                    <FileSpreadsheet size={24} />
                  </div>
                  <div>
                    <h3 className="font-medium">{recipe.title}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-[var(--text-secondary)]">
                        Recipe Code: {recipe.recipeCode}
                      </span>
                      <span className="text-sm text-[var(--text-secondary)]">
                        Version: {recipe.version}
                      </span>
                      <span className="text-sm text-[var(--text-secondary)]">
                        Product: {recipe.productCode}
                      </span>
                      <span className="text-sm text-[var(--text-secondary)] flex items-center">
                        <Percent size={14} className="mr-1" />
                        Yield: {recipe.yield}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {recipe.tags.map((tag, index) => (
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
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(recipe.status)}`}>
                    {recipe.status.charAt(0).toUpperCase() + recipe.status.slice(1)}
                  </span>
                  <div className="flex items-center text-sm text-[var(--text-secondary)] mt-2">
                    <Calendar size={14} className="mr-1" />
                    {recipe.lastUpdated}
                  </div>
                  <div className="flex items-center text-sm text-[var(--text-secondary)] mt-1">
                    <User size={14} className="mr-1" />
                    {recipe.updatedBy}
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

export default RecipeNormPage;
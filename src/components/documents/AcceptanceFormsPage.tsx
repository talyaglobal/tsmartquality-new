import React, { useState } from 'react';
import { Search, Plus, Filter, Download, FileText, Clock, Tag, User, Calendar, ClipboardList } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface AcceptanceForm {
  id: string;
  title: string;
  formNumber: string;
  version: string;
  status: 'active' | 'draft' | 'archived';
  lastUpdated: string;
  updatedBy: string;
  department: string;
  tags: string[];
}

const AcceptanceFormsPage: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);

  // Sample data - replace with actual data from your API
  const forms: AcceptanceForm[] = [
    {
      id: '1',
      title: 'Raw Material Acceptance Form',
      formNumber: 'QAS-001',
      version: '2.3',
      status: 'active',
      lastUpdated: '2024-03-15',
      updatedBy: 'John Smith',
      department: 'Quality Control',
      tags: ['Raw Materials', 'Acceptance', 'QAS']
    },
    {
      id: '2',
      title: 'Packaging Material Acceptance Form',
      formNumber: 'QAS-002',
      version: '1.5',
      status: 'active',
      lastUpdated: '2024-02-20',
      updatedBy: 'Sarah Johnson',
      department: 'Quality Control',
      tags: ['Packaging', 'Acceptance', 'QAS']
    },
    {
      id: '3',
      title: 'Finished Product Acceptance Form',
      formNumber: 'QAS-003',
      version: '3.1',
      status: 'draft',
      lastUpdated: '2024-03-10',
      updatedBy: 'Michael Brown',
      department: 'Production',
      tags: ['Finished Product', 'Acceptance', 'QAS']
    },
    {
      id: '4',
      title: 'Supplier Delivery Acceptance Form',
      formNumber: 'QAS-004',
      version: '1.2',
      status: 'active',
      lastUpdated: '2024-01-15',
      updatedBy: 'Emily Davis',
      department: 'Receiving',
      tags: ['Supplier', 'Delivery', 'QAS']
    },
    {
      id: '5',
      title: 'Equipment Acceptance Form',
      formNumber: 'QAS-005',
      version: '2.0',
      status: 'active',
      lastUpdated: '2024-02-05',
      updatedBy: 'John Smith',
      department: 'Maintenance',
      tags: ['Equipment', 'Acceptance', 'QAS']
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
          <h1 className="text-2xl font-bold mb-1">Acceptance Forms (QAS)</h1>
          <p className="text-[var(--text-secondary)]">
            Manage quality acceptance forms and checklists
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
            Add Form
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="w-96">
            <Input
              placeholder="Search forms..."
              startIcon={<Search size={20} />}
            />
          </div>
          <div className="flex space-x-2">
            <select className="border border-[var(--divider)] rounded-md px-3 py-2">
              <option value="">All Departments</option>
              <option value="quality">Quality Control</option>
              <option value="production">Production</option>
              <option value="receiving">Receiving</option>
              <option value="maintenance">Maintenance</option>
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
                  Form Type
                </label>
                <select className="w-full border border-[var(--divider)] rounded-md p-2">
                  <option value="">All Types</option>
                  <option value="raw">Raw Materials</option>
                  <option value="packaging">Packaging</option>
                  <option value="finished">Finished Product</option>
                  <option value="supplier">Supplier</option>
                  <option value="equipment">Equipment</option>
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
          {forms.map((form) => (
            <div
              key={form.id}
              className="p-4 border border-[var(--divider)] rounded-lg hover:border-[var(--primary-main)] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-2 rounded-lg bg-[var(--info-light)] text-[var(--info-dark)]">
                    <ClipboardList size={24} />
                  </div>
                  <div>
                    <h3 className="font-medium">{form.title}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-[var(--text-secondary)]">
                        Form #: {form.formNumber}
                      </span>
                      <span className="text-sm text-[var(--text-secondary)]">
                        Version: {form.version}
                      </span>
                      <span className="text-sm text-[var(--text-secondary)]">
                        Department: {form.department}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {form.tags.map((tag, index) => (
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
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(form.status)}`}>
                    {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                  </span>
                  <div className="flex items-center text-sm text-[var(--text-secondary)] mt-2">
                    <Calendar size={14} className="mr-1" />
                    {form.lastUpdated}
                  </div>
                  <div className="flex items-center text-sm text-[var(--text-secondary)] mt-1">
                    <User size={14} className="mr-1" />
                    {form.updatedBy}
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

export default AcceptanceFormsPage;
import React, { useState } from 'react';
import { AlertTriangle, Bell, CheckCircle, Clock, Filter, Plus, Search, X } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface Warning {
  id: string;
  title: string;
  description: string;
  type: 'critical' | 'warning' | 'info';
  status: 'active' | 'acknowledged' | 'resolved';
  source: string;
  createdAt: string;
  dueDate?: string;
  assignedTo?: string;
}

const WarningsPage: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);

  // Sample data - replace with actual data from your API
  const warnings: Warning[] = [
    {
      id: '1',
      title: 'Critical Quality Issue Detected',
      description: 'Quality check failed for batch B123. Immediate attention required.',
      type: 'critical',
      status: 'active',
      source: 'Quality Control',
      createdAt: '2024-03-15 10:30',
      dueDate: '2024-03-15 14:30',
      assignedTo: 'John Smith'
    },
    {
      id: '2',
      title: 'Inventory Level Warning',
      description: 'Raw material stock below minimum threshold.',
      type: 'warning',
      status: 'acknowledged',
      source: 'Inventory Management',
      createdAt: '2024-03-15 09:15',
      dueDate: '2024-03-16 09:15',
      assignedTo: 'Sarah Johnson'
    },
    {
      id: '3',
      title: 'Maintenance Schedule Reminder',
      description: 'Regular equipment maintenance due in 2 days.',
      type: 'info',
      status: 'active',
      source: 'Maintenance',
      createdAt: '2024-03-15 08:00',
      dueDate: '2024-03-17 08:00'
    }
  ];

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-[var(--error-light)] text-[var(--error-dark)]';
      case 'warning':
        return 'bg-[var(--warning-light)] text-[var(--warning-dark)]';
      case 'info':
        return 'bg-[var(--info-light)] text-[var(--info-dark)]';
      default:
        return 'bg-[var(--primary-light)] text-[var(--primary-dark)]';
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-[var(--error-light)] text-[var(--error-dark)]';
      case 'acknowledged':
        return 'bg-[var(--warning-light)] text-[var(--warning-dark)]';
      case 'resolved':
        return 'bg-[var(--success-light)] text-[var(--success-dark)]';
      default:
        return 'bg-[var(--info-light)] text-[var(--info-dark)]';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Warnings & Tasks</h1>
          <p className="text-[var(--text-secondary)]">
            Monitor and manage system warnings and pending tasks
          </p>
        </div>
        <Button 
          icon={<Plus size={20} />}
        >
          Create Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-[var(--error-light)] text-[var(--error-dark)]">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="font-medium">Critical</h3>
              <p className="text-2xl font-semibold">3</p>
            </div>
          </div>
          <div className="h-2 bg-[var(--divider)] rounded-full">
            <div className="h-2 bg-[var(--error-main)] rounded-full" style={{ width: '60%' }} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-[var(--warning-light)] text-[var(--warning-dark)]">
              <Bell size={24} />
            </div>
            <div>
              <h3 className="font-medium">Warnings</h3>
              <p className="text-2xl font-semibold">8</p>
            </div>
          </div>
          <div className="h-2 bg-[var(--divider)] rounded-full">
            <div className="h-2 bg-[var(--warning-main)] rounded-full" style={{ width: '40%' }} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-[var(--info-light)] text-[var(--info-dark)]">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="font-medium">Pending Tasks</h3>
              <p className="text-2xl font-semibold">12</p>
            </div>
          </div>
          <div className="h-2 bg-[var(--divider)] rounded-full">
            <div className="h-2 bg-[var(--info-main)] rounded-full" style={{ width: '75%' }} />
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="w-96">
            <Input
              placeholder="Search warnings..."
              startIcon={<Search size={20} />}
            />
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">Export</Button>
            <Button 
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              icon={<Filter size={20} />}
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
                  Type
                </label>
                <select className="w-full border border-[var(--divider)] rounded-md p-2">
                  <option value="">All Types</option>
                  <option value="critical">Critical</option>
                  <option value="warning">Warning</option>
                  <option value="info">Info</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Status
                </label>
                <select className="w-full border border-[var(--divider)] rounded-md p-2">
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Source
                </label>
                <select className="w-full border border-[var(--divider)] rounded-md p-2">
                  <option value="">All Sources</option>
                  <option value="quality">Quality Control</option>
                  <option value="inventory">Inventory</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {warnings.map((warning) => (
            <div
              key={warning.id}
              className="p-4 border border-[var(--divider)] rounded-lg hover:border-[var(--primary-main)] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className={`p-2 rounded-lg ${getTypeStyles(warning.type)}`}>
                    {warning.type === 'critical' ? <AlertTriangle size={20} /> :
                     warning.type === 'warning' ? <Bell size={20} /> :
                     <Clock size={20} />}
                  </div>
                  <div>
                    <h3 className="font-medium">{warning.title}</h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">
                      {warning.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-sm text-[var(--text-secondary)]">
                        Source: {warning.source}
                      </span>
                      {warning.assignedTo && (
                        <span className="text-sm text-[var(--text-secondary)]">
                          Assigned to: {warning.assignedTo}
                        </span>
                      )}
                      {warning.dueDate && (
                        <span className="text-sm text-[var(--text-secondary)]">
                          Due: {warning.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusStyles(warning.status)}`}>
                    {warning.status.charAt(0).toUpperCase() + warning.status.slice(1)}
                  </span>
                  {warning.status === 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<CheckCircle size={16} />}
                    >
                      Acknowledge
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default WarningsPage;
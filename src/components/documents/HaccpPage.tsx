import React, { useState } from 'react';
import { Search, Plus, Filter, Download, FileText, Clock, Tag, User, Calendar, FlaskConical } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface HaccpDocument {
  id: string;
  title: string;
  documentNumber: string;
  version: string;
  status: 'active' | 'draft' | 'archived';
  lastUpdated: string;
  updatedBy: string;
  process: string;
  tags: string[];
}

const HaccpPage: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);

  // Sample data - replace with actual data from your API
  const documents: HaccpDocument[] = [
    {
      id: '1',
      title: 'HACCP Plan - Chocolate Production',
      documentNumber: 'HACCP-001',
      version: '2.3',
      status: 'active',
      lastUpdated: '2024-03-15',
      updatedBy: 'John Smith',
      process: 'Chocolate Production',
      tags: ['HACCP', 'Production', 'Food Safety']
    },
    {
      id: '2',
      title: 'Critical Control Points - Packaging',
      documentNumber: 'HACCP-002',
      version: '1.5',
      status: 'active',
      lastUpdated: '2024-02-20',
      updatedBy: 'Sarah Johnson',
      process: 'Packaging',
      tags: ['CCP', 'Packaging', 'Control']
    },
    {
      id: '3',
      title: 'Hazard Analysis - Raw Materials',
      documentNumber: 'HACCP-003',
      version: '3.1',
      status: 'draft',
      lastUpdated: '2024-03-10',
      updatedBy: 'Michael Brown',
      process: 'Raw Materials',
      tags: ['Hazard', 'Analysis', 'Materials']
    },
    {
      id: '4',
      title: 'Monitoring Procedures - Temperature Control',
      documentNumber: 'HACCP-004',
      version: '1.2',
      status: 'active',
      lastUpdated: '2024-01-15',
      updatedBy: 'Emily Davis',
      process: 'Temperature Control',
      tags: ['Monitoring', 'Temperature', 'Control']
    },
    {
      id: '5',
      title: 'Verification Procedures - HACCP System',
      documentNumber: 'HACCP-005',
      version: '2.0',
      status: 'active',
      lastUpdated: '2024-02-05',
      updatedBy: 'John Smith',
      process: 'System Verification',
      tags: ['Verification', 'System', 'Audit']
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
          <h1 className="text-2xl font-bold mb-1">HACCP Documentation</h1>
          <p className="text-[var(--text-secondary)]">
            Hazard Analysis and Critical Control Points documentation
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
            Add Document
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="w-96">
            <Input
              placeholder="Search HACCP documents..."
              startIcon={<Search size={20} />}
            />
          </div>
          <div className="flex space-x-2">
            <select className="border border-[var(--divider)] rounded-md px-3 py-2">
              <option value="">All Processes</option>
              <option value="production">Production</option>
              <option value="packaging">Packaging</option>
              <option value="raw">Raw Materials</option>
              <option value="temperature">Temperature Control</option>
              <option value="verification">System Verification</option>
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
                  Document Type
                </label>
                <select className="w-full border border-[var(--divider)] rounded-md p-2">
                  <option value="">All Types</option>
                  <option value="plan">HACCP Plan</option>
                  <option value="ccp">Critical Control Points</option>
                  <option value="hazard">Hazard Analysis</option>
                  <option value="monitoring">Monitoring Procedures</option>
                  <option value="verification">Verification Procedures</option>
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
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-4 border border-[var(--divider)] rounded-lg hover:border-[var(--primary-main)] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-2 rounded-lg bg-[var(--info-light)] text-[var(--info-dark)]">
                    <FlaskConical size={24} />
                  </div>
                  <div>
                    <h3 className="font-medium">{doc.title}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-[var(--text-secondary)]">
                        Doc #: {doc.documentNumber}
                      </span>
                      <span className="text-sm text-[var(--text-secondary)]">
                        Version: {doc.version}
                      </span>
                      <span className="text-sm text-[var(--text-secondary)]">
                        Process: {doc.process}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {doc.tags.map((tag, index) => (
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
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doc.status)}`}>
                    {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                  </span>
                  <div className="flex items-center text-sm text-[var(--text-secondary)] mt-2">
                    <Calendar size={14} className="mr-1" />
                    {doc.lastUpdated}
                  </div>
                  <div className="flex items-center text-sm text-[var(--text-secondary)] mt-1">
                    <User size={14} className="mr-1" />
                    {doc.updatedBy}
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

export default HaccpPage;
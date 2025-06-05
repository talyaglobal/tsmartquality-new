import React, { useState } from 'react';
import { Search, Plus, Filter, Download, FileText, Clock, Tag, User, Calendar, ClipboardCheck } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface AuditReport {
  id: string;
  title: string;
  documentNumber: string;
  version: string;
  status: 'completed' | 'in_progress' | 'scheduled';
  auditDate: string;
  completedDate: string;
  auditor: string;
  auditType: string;
  findings: number;
  tags: string[];
}

const AuditReportsPage: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);

  // Sample data - replace with actual data from your API
  const auditReports: AuditReport[] = [
    {
      id: '1',
      title: 'Annual ISO 9001:2015 Internal Audit',
      documentNumber: 'AR-001',
      version: '1.0',
      status: 'completed',
      auditDate: '2024-02-15',
      completedDate: '2024-02-20',
      auditor: 'John Smith',
      auditType: 'Internal',
      findings: 5,
      tags: ['ISO 9001', 'Internal', 'Annual']
    },
    {
      id: '2',
      title: 'HACCP System Verification Audit',
      documentNumber: 'AR-002',
      version: '1.0',
      status: 'completed',
      auditDate: '2024-01-10',
      completedDate: '2024-01-15',
      auditor: 'Sarah Johnson',
      auditType: 'Internal',
      findings: 3,
      tags: ['HACCP', 'Verification', 'Food Safety']
    },
    {
      id: '3',
      title: 'Supplier Quality Audit - Organic Farms Ltd',
      documentNumber: 'AR-003',
      version: '1.0',
      status: 'in_progress',
      auditDate: '2024-03-10',
      completedDate: '',
      auditor: 'Michael Brown',
      auditType: 'Supplier',
      findings: 0,
      tags: ['Supplier', 'Quality', 'Organic']
    },
    {
      id: '4',
      title: 'BRC Food Safety Certification Audit',
      documentNumber: 'AR-004',
      version: '1.0',
      status: 'scheduled',
      auditDate: '2024-04-15',
      completedDate: '',
      auditor: 'External Auditor',
      auditType: 'External',
      findings: 0,
      tags: ['BRC', 'Certification', 'Food Safety']
    },
    {
      id: '5',
      title: 'Production Process Compliance Audit',
      documentNumber: 'AR-005',
      version: '1.0',
      status: 'completed',
      auditDate: '2024-02-05',
      completedDate: '2024-02-08',
      auditor: 'Emily Davis',
      auditType: 'Internal',
      findings: 2,
      tags: ['Process', 'Compliance', 'Production']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-[var(--success-light)] text-[var(--success-dark)]';
      case 'in_progress':
        return 'bg-[var(--warning-light)] text-[var(--warning-dark)]';
      case 'scheduled':
        return 'bg-[var(--info-light)] text-[var(--info-dark)]';
      default:
        return 'bg-[var(--primary-light)] text-[var(--primary-dark)]';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Audit Reports</h1>
          <p className="text-[var(--text-secondary)]">
            Manage internal, external, and supplier audit reports
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
            Add Audit Report
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="w-96">
            <Input
              placeholder="Search audit reports..."
              startIcon={<Search size={20} />}
            />
          </div>
          <div className="flex space-x-2">
            <select className="border border-[var(--divider)] rounded-md px-3 py-2">
              <option value="">All Audit Types</option>
              <option value="internal">Internal</option>
              <option value="external">External</option>
              <option value="supplier">Supplier</option>
              <option value="customer">Customer</option>
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
                  <option value="completed">Completed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Auditor
                </label>
                <select className="w-full border border-[var(--divider)] rounded-md p-2">
                  <option value="">All Auditors</option>
                  <option value="john">John Smith</option>
                  <option value="sarah">Sarah Johnson</option>
                  <option value="michael">Michael Brown</option>
                  <option value="emily">Emily Davis</option>
                  <option value="external">External Auditor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Audit Date
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Findings
                </label>
                <select className="w-full border border-[var(--divider)] rounded-md p-2">
                  <option value="">Any</option>
                  <option value="none">No Findings</option>
                  <option value="minor">Minor Findings Only</option>
                  <option value="major">Major Findings</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Standard
                </label>
                <select className="w-full border border-[var(--divider)] rounded-md p-2">
                  <option value="">All Standards</option>
                  <option value="iso9001">ISO 9001</option>
                  <option value="haccp">HACCP</option>
                  <option value="brc">BRC</option>
                  <option value="ifs">IFS</option>
                  <option value="fssc22000">FSSC 22000</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {auditReports.map((report) => (
            <div
              key={report.id}
              className="p-4 border border-[var(--divider)] rounded-lg hover:border-[var(--primary-main)] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-2 rounded-lg bg-[var(--primary-light)] text-[var(--primary-dark)]">
                    <ClipboardCheck size={24} />
                  </div>
                  <div>
                    <h3 className="font-medium">{report.title}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-[var(--text-secondary)]">
                        Doc #: {report.documentNumber}
                      </span>
                      <span className="text-sm text-[var(--text-secondary)]">
                        Type: {report.auditType}
                      </span>
                      <span className="text-sm text-[var(--text-secondary)]">
                        Auditor: {report.auditor}
                      </span>
                      <span className="text-sm text-[var(--text-secondary)]">
                        Findings: {report.findings}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {report.tags.map((tag, index) => (
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
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                    {report.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                  <div className="flex items-center text-sm text-[var(--text-secondary)] mt-2">
                    <Calendar size={14} className="mr-1" />
                    Audit Date: {report.auditDate}
                  </div>
                  {report.completedDate && (
                    <div className="flex items-center text-sm text-[var(--text-secondary)] mt-1">
                      <Calendar size={14} className="mr-1" />
                      Completed: {report.completedDate}
                    </div>
                  )}
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

export default AuditReportsPage;
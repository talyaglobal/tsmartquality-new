import React, { useState } from 'react';
import { Search, Plus, Filter, Download, FileText, Clock, Tag, User, Calendar, FileCertificate, Award } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface Certification {
  id: string;
  title: string;
  documentNumber: string;
  version: string;
  status: 'active' | 'expired' | 'pending';
  issueDate: string;
  expiryDate: string;
  issuedBy: string;
  certType: string;
  tags: string[];
}

const CertificationsDocPage: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);

  // Sample data - replace with actual data from your API
  const certifications: Certification[] = [
    {
      id: '1',
      title: 'ISO 9001:2015 Quality Management System',
      documentNumber: 'CERT-001',
      version: '1.0',
      status: 'active',
      issueDate: '2023-05-15',
      expiryDate: '2026-05-14',
      issuedBy: 'International Standards Organization',
      certType: 'Quality',
      tags: ['ISO', 'Quality', 'Management System']
    },
    {
      id: '2',
      title: 'HACCP Certification',
      documentNumber: 'CERT-002',
      version: '1.0',
      status: 'active',
      issueDate: '2023-07-20',
      expiryDate: '2025-07-19',
      issuedBy: 'Food Safety Authority',
      certType: 'Food Safety',
      tags: ['HACCP', 'Food Safety', 'Compliance']
    },
    {
      id: '3',
      title: 'BRC Global Standard for Food Safety',
      documentNumber: 'CERT-003',
      version: '1.0',
      status: 'active',
      issueDate: '2023-09-10',
      expiryDate: '2024-09-09',
      issuedBy: 'British Retail Consortium',
      certType: 'Food Safety',
      tags: ['BRC', 'Food Safety', 'Global Standard']
    },
    {
      id: '4',
      title: 'Organic Certification',
      documentNumber: 'CERT-004',
      version: '1.0',
      status: 'active',
      issueDate: '2023-11-15',
      expiryDate: '2024-11-14',
      issuedBy: 'Organic Certification Body',
      certType: 'Product',
      tags: ['Organic', 'Product', 'Certification']
    },
    {
      id: '5',
      title: 'Fair Trade Certification',
      documentNumber: 'CERT-005',
      version: '1.0',
      status: 'pending',
      issueDate: '2024-03-01',
      expiryDate: '2027-02-28',
      issuedBy: 'Fair Trade Organization',
      certType: 'Ethical',
      tags: ['Fair Trade', 'Ethical', 'Sustainable']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-[var(--success-light)] text-[var(--success-dark)]';
      case 'expired':
        return 'bg-[var(--error-light)] text-[var(--error-dark)]';
      case 'pending':
        return 'bg-[var(--warning-light)] text-[var(--warning-dark)]';
      default:
        return 'bg-[var(--info-light)] text-[var(--info-dark)]';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Certifications</h1>
          <p className="text-[var(--text-secondary)]">
            Manage quality and compliance certifications
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
            Add Certification
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="w-96">
            <Input
              placeholder="Search certifications..."
              startIcon={<Search size={20} />}
            />
          </div>
          <div className="flex space-x-2">
            <select className="border border-[var(--divider)] rounded-md px-3 py-2">
              <option value="">All Types</option>
              <option value="quality">Quality</option>
              <option value="food">Food Safety</option>
              <option value="product">Product</option>
              <option value="ethical">Ethical</option>
              <option value="environmental">Environmental</option>
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
                  <option value="expired">Expired</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Issuing Body
                </label>
                <select className="w-full border border-[var(--divider)] rounded-md p-2">
                  <option value="">All Issuers</option>
                  <option value="iso">International Standards Organization</option>
                  <option value="fsa">Food Safety Authority</option>
                  <option value="brc">British Retail Consortium</option>
                  <option value="organic">Organic Certification Body</option>
                  <option value="fairtrade">Fair Trade Organization</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Expiry Date
                </label>
                <select className="w-full border border-[var(--divider)] rounded-md p-2">
                  <option value="">Any Time</option>
                  <option value="expired">Expired</option>
                  <option value="30days">Expiring in 30 days</option>
                  <option value="90days">Expiring in 90 days</option>
                  <option value="6months">Expiring in 6 months</option>
                  <option value="1year">Expiring in 1 year</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {certifications.map((cert) => (
            <div
              key={cert.id}
              className="p-4 border border-[var(--divider)] rounded-lg hover:border-[var(--primary-main)] transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="p-2 rounded-lg bg-[var(--success-light)] text-[var(--success-dark)]">
                    <Award size={24} />
                  </div>
                  <div>
                    <h3 className="font-medium">{cert.title}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-[var(--text-secondary)]">
                        Doc #: {cert.documentNumber}
                      </span>
                      <span className="text-sm text-[var(--text-secondary)]">
                        Type: {cert.certType}
                      </span>
                      <span className="text-sm text-[var(--text-secondary)]">
                        Issued By: {cert.issuedBy}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {cert.tags.map((tag, index) => (
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
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(cert.status)}`}>
                    {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                  </span>
                  <div className="flex items-center text-sm text-[var(--text-secondary)] mt-2">
                    <Calendar size={14} className="mr-1" />
                    Issue: {cert.issueDate}
                  </div>
                  <div className="flex items-center text-sm text-[var(--text-secondary)] mt-1">
                    <Calendar size={14} className="mr-1" />
                    Expiry: {cert.expiryDate}
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

export default CertificationsDocPage;
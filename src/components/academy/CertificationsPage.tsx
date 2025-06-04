import React, { useState } from 'react';
import { Plus, Search, Award, Calendar, Download } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface Certification {
  id: string;
  title: string;
  description: string;
  issueDate: string;
  expiryDate: string;
  status: 'active' | 'expired' | 'pending';
  recipient: string;
  type: string;
  issuer: string;
}

const CertificationsPage: React.FC = () => {
  // Sample data - replace with actual data from your API
  const certifications: Certification[] = [
    {
      id: '1',
      title: 'Quality Management Professional',
      description: 'Certified Quality Management Professional',
      issueDate: '2024-01-15',
      expiryDate: '2025-01-15',
      status: 'active',
      recipient: 'John Smith',
      type: 'Professional',
      issuer: 'Quality Management Institute'
    },
    {
      id: '2',
      title: 'ISO 9001:2015 Lead Auditor',
      description: 'Certified Lead Auditor for ISO 9001:2015',
      issueDate: '2023-12-01',
      expiryDate: '2024-12-01',
      status: 'active',
      recipient: 'Sarah Johnson',
      type: 'Auditor',
      issuer: 'International Standards Organization'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Certifications</h1>
          <p className="text-[var(--text-secondary)]">
            Manage quality certifications and achievements
          </p>
        </div>
        <Button 
          icon={<Plus size={20} />}
        >
          Add Certification
        </Button>
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
              <option value="professional">Professional</option>
              <option value="auditor">Auditor</option>
              <option value="specialist">Specialist</option>
            </select>
            <select className="border border-[var(--divider)] rounded-md px-3 py-2">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--divider)]">
            <thead className="bg-[var(--background-paper)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Certification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Recipient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Issue Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-[var(--background-paper)] divide-y divide-[var(--divider)]">
              {certifications.map((cert) => (
                <tr key={cert.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Award className="h-8 w-8 text-[var(--primary-main)] mr-3" />
                      <div>
                        <div className="text-sm font-medium">{cert.title}</div>
                        <div className="text-sm text-[var(--text-secondary)]">{cert.issuer}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">{cert.recipient}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">{cert.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">{cert.issueDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">{cert.expiryDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${cert.status === 'active' ? 'bg-[var(--success-light)] text-[var(--success-dark)]' :
                        cert.status === 'expired' ? 'bg-[var(--error-light)] text-[var(--error-dark)]' :
                        'bg-[var(--warning-light)] text-[var(--warning-dark)]'}`}>
                      {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Download size={16} />}
                    >
                      Download
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default CertificationsPage;
import React from 'react';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';
import Card from '../ui/Card';

const CompliancePage: React.FC = () => {
  const complianceFrameworks = [
    {
      name: 'ISO 9001:2015',
      description: 'Quality Management System certification ensuring consistent quality standards.',
      status: 'Certified',
      lastAudit: '2024-01-15',
      nextAudit: '2024-07-15'
    },
    {
      name: 'HACCP',
      description: 'Hazard Analysis Critical Control Point system for food safety.',
      status: 'Certified',
      lastAudit: '2024-02-20',
      nextAudit: '2024-08-20'
    },
    {
      name: 'FSSC 22000',
      description: 'Food Safety System Certification for food manufacturing.',
      status: 'In Progress',
      lastAudit: 'N/A',
      nextAudit: '2024-06-01'
    }
  ];

  const regulations = [
    {
      name: 'FDA Compliance',
      description: 'Adherence to Food and Drug Administration regulations.',
      requirements: [
        'Product registration and listing',
        'Good Manufacturing Practices (GMP)',
        'Food safety protocols',
        'Labeling requirements'
      ]
    },
    {
      name: 'EU Food Safety',
      description: 'European Union food safety and quality regulations.',
      requirements: [
        'HACCP implementation',
        'Traceability systems',
        'Allergen management',
        'Labeling compliance'
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Compliance & Certifications</h1>
        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
          Our commitment to maintaining the highest standards of quality and safety through rigorous compliance with international standards and regulations.
        </p>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Certification Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complianceFrameworks.map((framework, index) => (
            <Card key={index}>
              <div className="flex items-start">
                <div className="p-3 rounded-lg bg-[var(--primary-main)] bg-opacity-10 mr-4">
                  <Shield className="text-[var(--primary-main)]" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">{framework.name}</h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-4">
                    {framework.description}
                  </p>
                  <div className="flex items-center mb-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      framework.status === 'Certified' 
                        ? 'bg-[var(--success-light)] text-[var(--success-dark)]'
                        : 'bg-[var(--warning-light)] text-[var(--warning-dark)]'
                    }`}>
                      {framework.status === 'Certified' ? (
                        <CheckCircle size={14} className="mr-1" />
                      ) : (
                        <AlertCircle size={14} className="mr-1" />
                      )}
                      {framework.status}
                    </span>
                  </div>
                  <div className="text-sm">
                    <p>Last Audit: {framework.lastAudit}</p>
                    <p>Next Audit: {framework.nextAudit}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-6">Regulatory Compliance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {regulations.map((regulation, index) => (
            <Card key={index}>
              <h3 className="text-xl font-semibold mb-4">{regulation.name}</h3>
              <p className="text-[var(--text-secondary)] mb-4">
                {regulation.description}
              </p>
              <div className="space-y-2">
                <h4 className="font-medium mb-2">Key Requirements:</h4>
                <ul className="list-disc list-inside space-y-1 text-[var(--text-secondary)]">
                  {regulation.requirements.map((req, reqIndex) => (
                    <li key={reqIndex}>{req}</li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-12 text-center">
        <Card>
          <h2 className="text-2xl font-semibold mb-4">Need More Information?</h2>
          <p className="text-[var(--text-secondary)] mb-6">
            Contact our compliance team for detailed information about our certifications and regulatory compliance.
          </p>
          <Button>Contact Compliance Team</Button>
        </Card>
      </div>
    </div>
  );
};

export default CompliancePage;
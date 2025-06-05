import React from 'react';
import { Shield, Lock, Key, Server, Users, FileText } from 'lucide-react';
import Card from '../ui/Card';

const SecurityPage: React.FC = () => {
  const securityFeatures = [
    {
      icon: <Shield className="text-[var(--primary-main)]" size={32} />,
      title: 'Data Encryption',
      description: 'All data is encrypted at rest and in transit using industry-standard encryption protocols.'
    },
    {
      icon: <Lock className="text-[var(--success-main)]" size={32} />,
      title: 'Access Control',
      description: 'Role-based access control ensures users only access authorized information.'
    },
    {
      icon: <Key className="text-[var(--warning-main)]" size={32} />,
      title: 'Authentication',
      description: 'Multi-factor authentication and single sign-on options for enhanced security.'
    },
    {
      icon: <Server className="text-[var(--info-main)]" size={32} />,
      title: 'Infrastructure',
      description: 'Secure cloud infrastructure with regular security audits and monitoring.'
    },
    {
      icon: <Users className="text-[var(--error-main)]" size={32} />,
      title: 'User Management',
      description: 'Comprehensive user management with detailed audit logs and activity tracking.'
    },
    {
      icon: <FileText className="text-[var(--primary-main)]" size={32} />,
      title: 'Compliance',
      description: 'Adherence to international security standards and regulations.'
    }
  ];

  const certifications = [
    'ISO 27001',
    'SOC 2 Type II',
    'GDPR Compliant',
    'HIPAA Compliant',
    'PCI DSS'
  ];

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Security & Compliance</h1>
        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
          Your data security is our top priority. Learn about our comprehensive security measures and compliance standards.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {securityFeatures.map((feature, index) => (
          <Card key={index}>
            <div className="mb-4">{feature.icon}</div>
            <h2 className="text-xl font-bold mb-2">{feature.title}</h2>
            <p className="text-[var(--text-secondary)]">{feature.description}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <h2 className="text-2xl font-bold mb-6">Security Measures</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Physical Security</h3>
              <p className="text-[var(--text-secondary)]">
                Our infrastructure is hosted in secure data centers with 24/7 monitoring, biometric access controls, and redundant power systems.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Network Security</h3>
              <p className="text-[var(--text-secondary)]">
                Multiple layers of network security including firewalls, intrusion detection, and DDoS protection.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Application Security</h3>
              <p className="text-[var(--text-secondary)]">
                Regular security assessments, penetration testing, and vulnerability scanning to ensure application security.
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-2xl font-bold mb-6">Certifications & Compliance</h2>
          <div className="grid grid-cols-2 gap-4">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="p-4 bg-[var(--background-default)] rounded-lg text-center"
              >
                <Shield size={24} className="text-[var(--primary-main)] mx-auto mb-2" />
                <span className="font-medium">{cert}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-16">
        <Card>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Security Documentation</h2>
            <p className="text-[var(--text-secondary)] mb-6">
              Download our security documentation or request a security assessment report.
            </p>
            <div className="flex justify-center space-x-4">
              <button className="px-6 py-2 bg-[var(--primary-main)] text-white rounded-lg hover:bg-[var(--primary-dark)] transition-colors">
                Download Security Whitepaper
              </button>
              <button className="px-6 py-2 border border-[var(--primary-main)] text-[var(--primary-main)] rounded-lg hover:bg-[var(--primary-light)] hover:bg-opacity-10 transition-colors">
                Request Security Assessment
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SecurityPage;
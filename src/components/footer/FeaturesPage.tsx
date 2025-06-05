import React from 'react';
import { Shield, Users, FileText, AlertTriangle, BarChart2, Award, Settings, Box } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';

const FeaturesPage: React.FC = () => {
  const navigate = useNavigate();
  
  const features = [
    {
      icon: <Shield className="text-[var(--primary-main)]" size={32} />,
      title: 'Quality Control',
      description: 'Comprehensive quality control tools for monitoring and improving product quality.',
      benefits: [
        'Real-time quality monitoring',
        'Automated quality checks',
        'Defect tracking and analysis'
      ]
    },
    {
      icon: <Users className="text-[var(--success-main)]\" size={32} />,
      title: 'Supplier Management',
      description: 'Streamline supplier relationships and ensure quality standards.',
      benefits: [
        'Supplier evaluation',
        'Performance tracking',
        'Quality metrics'
      ]
    },
    {
      icon: <FileText className="text-[var(--info-main)]" size={32} />,
      title: 'Document Control',
      description: 'Centralized document management for quality-related documentation.',
      benefits: [
        'Version control',
        'Approval workflows',
        'Compliance tracking'
      ]
    },
    {
      icon: <AlertTriangle className="text-[var(--warning-main)]\" size={32} />,
      title: 'Complaint Management',
      description: 'Efficiently handle and resolve quality-related complaints.',
      benefits: [
        'Complaint tracking',
        'Resolution workflows',
        'Root cause analysis'
      ]
    },
    {
      icon: <BarChart2 className="text-[var(--error-main)]" size={32} />,
      title: 'Analytics & Reporting',
      description: 'Powerful analytics tools for data-driven decision making.',
      benefits: [
        'Custom dashboards',
        'Trend analysis',
        'Performance metrics'
      ]
    },
    {
      icon: <Award className="text-[var(--primary-main)]\" size={32} />,
      title: 'Certification Management',
      description: 'Track and manage quality certifications and compliance.',
      benefits: [
        'Certification tracking',
        'Audit management',
        'Compliance monitoring'
      ]
    },
    {
      icon: <Settings className="text-[var(--success-main)]" size={32} />,
      title: 'Process Automation',
      description: 'Automate quality processes and workflows.',
      benefits: [
        'Workflow automation',
        'Task management',
        'Notifications'
      ]
    },
    {
      icon: <Box className="text-[var(--info-main)]\" size={32} />,
      title: 'Inventory Quality',
      description: 'Ensure quality throughout your inventory management.',
      benefits: [
        'Quality inspections',
        'Batch tracking',
        'Inventory control'
      ]
    }
  ];

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Features</h1>
        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
          Discover the powerful features that make TSmart Quality the leading choice for quality management.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <Card key={index}>
            <div className="mb-6">{feature.icon}</div>
            <h2 className="text-xl font-bold mb-4">{feature.title}</h2>
            <p className="text-[var(--text-secondary)] mb-6">{feature.description}</p>
            <ul className="space-y-2 mb-6">
              {feature.benefits.map((benefit, benefitIndex) => (
                <li key={benefitIndex} className="flex items-center text-[var(--text-secondary)]">
                  <Shield size={16} className="text-[var(--primary-main)] mr-2" />
                  {benefit}
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full">
              Learn More
            </Button>
          </Card>
        ))}
      </div>

      <div className="mt-16">
        <Card>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-[var(--text-secondary)] mb-6">
              Experience the power of TSmart Quality firsthand with our free trial.
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" onClick={() => navigate('/contact')}>
                Schedule Demo
              </Button>
              <Button onClick={() => navigate('/register')}>
                Start Free Trial
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FeaturesPage;
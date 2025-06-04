import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, CheckCircle, Shield, Users, BarChart2, FileText, Award } from 'lucide-react';
import Button from '../ui/Button';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Box className="text-[var(--primary-main)]" size={32} />,
      title: 'Product Quality Management',
      description: 'Comprehensive tools for managing product quality throughout the lifecycle'
    },
    {
      icon: <CheckCircle className="text-[var(--success-main)]\" size={32} />,
      title: 'Audit & Compliance',
      description: 'Streamlined audit processes and compliance tracking'
    },
    {
      icon: <Shield className="text-[var(--warning-main)]" size={32} />,
      title: 'Document Control',
      description: 'Centralized document management and version control'
    },
    {
      icon: <Users className="text-[var(--info-main)]\" size={32} />,
      title: 'Supplier Management',
      description: 'Efficient supplier qualification and performance monitoring'
    },
    {
      icon: <BarChart2 className="text-[var(--error-main)]" size={32} />,
      title: 'Analytics & Reporting',
      description: 'Advanced analytics and customizable reporting tools'
    },
    {
      icon: <Award className="text-[var(--primary-main)]\" size={32} />,
      title: 'Training & Certification',
      description: 'Employee training management and certification tracking'
    }
  ];

  const handleBypassAuth = () => {
    localStorage.setItem('auth_token', 'demo_token');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[var(--background-default)]">
      {/* Header */}
      <header className="bg-[var(--background-paper)] border-b border-[var(--divider)] py-6">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Box className="text-[var(--primary-main)] w-12 h-12" />
              <h1 className="text-[var(--primary-main)] text-2xl font-bold ml-3">TSmart Quality</h1>
            </div>
            <div className="space-x-4">
              <Button variant="outline" onClick={() => navigate('/login')}>
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-[var(--primary-main)] to-[var(--primary-dark)] text-white">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Quality Management Made Simple
          </h1>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Streamline your quality processes, ensure compliance, and drive continuous improvement with our comprehensive quality management system.
          </p>
          <div className="flex justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-white text-[var(--primary-main)] hover:bg-opacity-90"
            >
              Start Free Trial
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need for Quality Excellence
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="p-6 bg-[var(--background-paper)] rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-[var(--text-secondary)]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[var(--background-paper)]">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Transform Your Quality Management?
          </h2>
          <p className="text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
            Join thousands of companies using TSmart Quality to streamline their quality processes and ensure product excellence.
          </p>
          <div className="space-x-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/contact')}
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[var(--background-paper)] border-t border-[var(--divider)] py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Box className="text-[var(--primary-main)] w-8 h-8" />
                <h3 className="text-[var(--primary-main)] font-bold ml-2">TSmart Quality</h3>
              </div>
              <p className="text-[var(--text-secondary)]">
                Empowering quality excellence through intelligent solutions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-[var(--text-secondary)]">
                <li>Features</li>
                <li>Pricing</li>
                <li>Case Studies</li>
                <li>Documentation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-[var(--text-secondary)]">
                <li>About Us</li>
                <li>Careers</li>
                <li>Blog</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-[var(--text-secondary)]">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Security</li>
                <li>Compliance</li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-[var(--divider)] text-center">
            <p className="text-[var(--text-secondary)]">&copy; {new Date().getFullYear()} TSmart Quality. All rights reserved.</p>
            <button 
              onClick={handleBypassAuth}
              className="text-[var(--text-secondary)] hover:text-[var(--primary-main)] text-sm mt-2"
            >
              Access Dashboard
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
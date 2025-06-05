import React from 'react';
import { Book, FileText, Video, Code, Search } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

const DocumentationPage: React.FC = () => {
  const sections = [
    {
      title: 'Getting Started',
      icon: <Book className="text-[var(--primary-main)]" size={24} />,
      items: [
        'Quick Start Guide',
        'Installation',
        'Basic Configuration',
        'First Steps'
      ]
    },
    {
      title: 'User Guides',
      icon: <FileText className="text-[var(--success-main)]" size={24} />,
      items: [
        'Dashboard Overview',
        'Quality Management',
        'Document Control',
        'Supplier Management'
      ]
    },
    {
      title: 'Video Tutorials',
      icon: <Video className="text-[var(--warning-main)]" size={24} />,
      items: [
        'Introduction to TSmart Quality',
        'Setting Up Your First Project',
        'Advanced Features',
        'Best Practices'
      ]
    },
    {
      title: 'API Reference',
      icon: <Code className="text-[var(--info-main)]" size={24} />,
      items: [
        'Authentication',
        'Endpoints',
        'Data Models',
        'Examples'
      ]
    }
  ];

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Documentation</h1>
        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
          Everything you need to know about TSmart Quality. From getting started to advanced features.
        </p>
        <div className="max-w-2xl mx-auto mt-8">
          <Input
            placeholder="Search documentation..."
            startIcon={<Search size={20} />}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sections.map((section, index) => (
          <Card key={index}>
            <div className="flex items-center mb-6">
              {section.icon}
              <h2 className="text-xl font-bold ml-3">{section.title}</h2>
            </div>
            <ul className="space-y-4">
              {section.items.map((item, itemIndex) => (
                <li key={itemIndex}>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                  >
                    {item}
                  </Button>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <div className="mt-16">
        <Card>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Need Help?</h2>
            <p className="text-[var(--text-secondary)] mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline">
                Contact Support
              </Button>
              <Button>
                Join Community
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DocumentationPage;
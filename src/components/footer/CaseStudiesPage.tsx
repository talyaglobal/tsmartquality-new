import React from 'react';
import { ArrowRight, Building, CheckCircle, TrendingUp } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

const CaseStudiesPage: React.FC = () => {
  const caseStudies = [
    {
      id: '1',
      title: 'Global Manufacturing Company Improves Quality Metrics by 45%',
      company: 'ABC Manufacturing',
      industry: 'Manufacturing',
      challenge: 'Struggling with quality control across multiple facilities',
      solution: 'Implemented TSmart Quality management system',
      results: [
        '45% improvement in quality metrics',
        '30% reduction in defects',
        '25% increase in efficiency'
      ],
      image: 'https://images.pexels.com/photos/3913028/pexels-photo-3913028.jpeg'
    },
    {
      id: '2',
      title: 'Food Producer Achieves ISO Certification in Record Time',
      company: 'Fresh Foods Inc.',
      industry: 'Food & Beverage',
      challenge: 'Complex compliance requirements and documentation',
      solution: 'Deployed TSmart Quality compliance module',
      results: [
        'ISO certification achieved in 6 months',
        '60% faster document processing',
        '40% reduction in audit preparation time'
      ],
      image: 'https://images.pexels.com/photos/3913029/pexels-photo-3913029.jpeg'
    },
    {
      id: '3',
      title: 'Pharmaceutical Company Streamlines Quality Processes',
      company: 'PharmaCorp',
      industry: 'Pharmaceuticals',
      challenge: 'Manual quality control processes causing delays',
      solution: 'Integrated TSmart Quality automation tools',
      results: [
        '50% reduction in quality control time',
        '75% fewer documentation errors',
        '35% cost savings in quality management'
      ],
      image: 'https://images.pexels.com/photos/3913030/pexels-photo-3913030.jpeg'
    }
  ];

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Success Stories</h1>
        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
          Discover how organizations are transforming their quality management with TSmart Quality.
        </p>
      </div>

      <div className="space-y-12">
        {caseStudies.map((study) => (
          <Card key={study.id}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <img
                  src={study.image}
                  alt={study.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Building size={20} className="text-[var(--primary-main)]" />
                  <span className="text-[var(--primary-main)] font-medium">{study.company}</span>
                  <span className="text-[var(--text-secondary)]">• {study.industry}</span>
                </div>
                <h2 className="text-2xl font-bold mb-4">{study.title}</h2>
                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className="font-semibold mb-2">Challenge</h3>
                    <p className="text-[var(--text-secondary)]">{study.challenge}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Solution</h3>
                    <p className="text-[var(--text-secondary)]">{study.solution}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Results</h3>
                    <ul className="space-y-2">
                      {study.results.map((result, index) => (
                        <li key={index} className="flex items-center text-[var(--text-secondary)]">
                          <CheckCircle size={16} className="text-[var(--success-main)] mr-2" />
                          {result}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <Button
                  variant="outline"
                  icon={<ArrowRight size={20} />}
                >
                  Read Full Case Study
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CaseStudiesPage;
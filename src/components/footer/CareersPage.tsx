import React from 'react';
import { Briefcase, MapPin, Clock, DollarSign } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';

const CareersPage: React.FC = () => {
  const navigate = useNavigate();
  
  const jobs = [
    {
      id: '1',
      title: 'Senior Quality Engineer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$120,000 - $150,000',
      description: 'We are seeking an experienced Quality Engineer to join our growing team. You will be responsible for developing and implementing quality assurance standards, testing methodologies, and continuous improvement initiatives.'
    },
    {
      id: '2',
      title: 'Quality Assurance Manager',
      department: 'Quality',
      location: 'New York, NY',
      type: 'Full-time',
      salary: '$130,000 - $160,000',
      description: 'Looking for a seasoned QA Manager to lead our quality assurance team. You will oversee quality control processes, manage a team of QA specialists, and ensure compliance with industry standards and regulations.'
    },
    {
      id: '3',
      title: 'Software Developer',
      department: 'Technology',
      location: 'Remote',
      type: 'Full-time',
      salary: '$100,000 - $140,000',
      description: 'Join our development team to build cutting-edge quality management solutions. You will work on feature development, system architecture, and integration with various enterprise systems.'
    },
    {
      id: '4',
      title: 'Product Manager - Quality Solutions',
      department: 'Product',
      location: 'Chicago, IL',
      type: 'Full-time',
      salary: '$110,000 - $145,000',
      description: 'Lead the product strategy for our quality management solutions. You will work closely with customers, engineering teams, and stakeholders to define product roadmaps and deliver exceptional user experiences.'
    }
  ];

  const benefits = [
    {
      icon: <DollarSign className="text-[var(--primary-main)]" size={32} />,
      title: 'Competitive Salary',
      description: 'Industry-leading compensation packages'
    },
    {
      icon: <Clock className="text-[var(--success-main)]" size={32} />,
      title: 'Flexible Hours',
      description: 'Work-life balance is important to us'
    },
    {
      icon: <Briefcase className="text-[var(--info-main)]" size={32} />,
      title: 'Growth Opportunities',
      description: 'Clear career progression paths'
    }
  ];

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Join Our Team</h1>
        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
          Help us shape the future of quality management. We're always looking for talented individuals to join our team.
        </p>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">Why Work With Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index}>
              <div className="text-center">
                <div className="mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-[var(--text-secondary)]">{benefit.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-center mb-8">Open Positions</h2>
        <div className="space-y-6">
          {jobs.map((job) => (
            <Card key={job.id}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
                    <div className="flex items-center">
                      <Briefcase size={16} className="mr-1" />
                      {job.department}
                    </div>
                    <div className="flex items-center">
                      <MapPin size={16} className="mr-1" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <Clock size={16} className="mr-1" />
                      {job.type}
                    </div>
                    <div className="flex items-center">
                      <DollarSign size={16} className="mr-1" />
                      {job.salary}
                    </div>
                  </div>
                  <p className="text-[var(--text-secondary)] mt-4">{job.description}</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <Button>Apply Now</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="mt-16 text-center">
        <Card>
          <h2 className="text-2xl font-bold mb-4">Don't See the Right Fit?</h2>
          <p className="text-[var(--text-secondary)] mb-6 max-w-2xl mx-auto">
            We're always looking for talented individuals to join our team. Send us your resume and we'll keep you in mind for future opportunities.
          </p>
          <Button onClick={() => navigate('/contact')}>
            Contact Us
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default CareersPage;
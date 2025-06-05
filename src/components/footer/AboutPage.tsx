import React from 'react';
import { Building, Users, Globe, Award, Rocket } from 'lucide-react';
import Card from '../ui/Card';

const AboutPage: React.FC = () => {
  const team = [
    {
      name: 'John Smith',
      role: 'CEO',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    },
    {
      name: 'Sarah Johnson',
      role: 'CTO',
      image: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg',
    },
    {
      name: 'Michael Brown',
      role: 'Head of Quality',
      image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg',
    }
  ];

  const values = [
    {
      icon: <Award className="text-[var(--primary-main)]" size={32} />,
      title: 'Excellence',
      description: 'We strive for excellence in everything we do'
    },
    {
      icon: <Users className="text-[var(--success-main)]" size={32} />,
      title: 'Collaboration',
      description: 'Working together to achieve common goals'
    },
    {
      icon: <Globe className="text-[var(--info-main)]" size={32} />,
      title: 'Innovation',
      description: 'Constantly pushing boundaries and embracing new ideas'
    }
  ];

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">About TSmart Quality</h1>
        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto">
          Leading the way in quality management solutions with innovative technology and industry expertise.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <Card>
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-[var(--text-secondary)]">
            To empower organizations with cutting-edge quality management solutions that drive excellence, 
            ensure compliance, and foster continuous improvement.
          </p>
        </Card>

        <Card>
          <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
          <p className="text-[var(--text-secondary)]">
            To be the global leader in quality management software, setting industry standards and 
            helping organizations achieve their quality goals.
          </p>
        </Card>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, index) => (
            <Card key={index}>
              <div className="text-center">
                <div className="mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-[var(--text-secondary)]">{value.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-center mb-8">Leadership Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <Card key={index}>
              <div className="text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                <p className="text-[var(--text-secondary)]">{member.role}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
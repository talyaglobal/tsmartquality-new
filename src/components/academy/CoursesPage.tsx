import React, { useState } from 'react';
import { Plus, Search, BookOpen, Clock, Users } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  enrolled: number;
  status: 'active' | 'draft' | 'archived';
  category: string;
  thumbnail: string;
}

const CoursesPage: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);

  // Sample data - replace with actual data from your API
  const courses: Course[] = [
    {
      id: '1',
      title: 'Quality Management Fundamentals',
      description: 'Learn the basics of quality management systems and processes',
      instructor: 'John Smith',
      duration: '8 hours',
      enrolled: 45,
      status: 'active',
      category: 'Quality Management',
      thumbnail: 'https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg'
    },
    {
      id: '2',
      title: 'ISO 9001:2015 Implementation',
      description: 'Comprehensive guide to implementing ISO 9001:2015',
      instructor: 'Sarah Johnson',
      duration: '12 hours',
      enrolled: 32,
      status: 'active',
      category: 'Standards',
      thumbnail: 'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Courses</h1>
          <p className="text-[var(--text-secondary)]">
            Manage and organize training courses
          </p>
        </div>
        <Button 
          icon={<Plus size={20} />}
        >
          Create Course
        </Button>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="w-96">
            <Input
              placeholder="Search courses..."
              startIcon={<Search size={20} />}
            />
          </div>
          <div className="flex space-x-2">
            <select className="border border-[var(--divider)] rounded-md px-3 py-2">
              <option value="">All Categories</option>
              <option value="quality">Quality Management</option>
              <option value="standards">Standards</option>
              <option value="safety">Safety</option>
              <option value="compliance">Compliance</option>
            </select>
            <select className="border border-[var(--divider)] rounded-md px-3 py-2">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-[var(--background-paper)] rounded-lg shadow overflow-hidden group"
            >
              <div className="relative aspect-video">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-white border-white hover:bg-white hover:text-black"
                  >
                    View Course
                  </Button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-lg mb-2">{course.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-4">
                  {course.description}
                </p>
                <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
                  <div className="flex items-center">
                    <Clock size={16} className="mr-1" />
                    {course.duration}
                  </div>
                  <div className="flex items-center">
                    <Users size={16} className="mr-1" />
                    {course.enrolled} enrolled
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-[var(--divider)]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{course.instructor}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      course.status === 'active' ? 'bg-[var(--success-light)] text-[var(--success-dark)]' :
                      course.status === 'draft' ? 'bg-[var(--warning-light)] text-[var(--warning-dark)]' :
                      'bg-[var(--error-light)] text-[var(--error-dark)]'
                    }`}>
                      {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default CoursesPage;
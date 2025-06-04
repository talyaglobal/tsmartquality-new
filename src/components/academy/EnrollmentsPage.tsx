import React, { useState } from 'react';
import { Search, UserPlus, BookOpen, Calendar, CheckCircle } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface Enrollment {
  id: string;
  user: {
    name: string;
    email: string;
    department: string;
  };
  course: {
    title: string;
    instructor: string;
  };
  enrollmentDate: string;
  progress: number;
  status: 'in_progress' | 'completed' | 'not_started';
  dueDate: string;
}

const EnrollmentsPage: React.FC = () => {
  // Sample data - replace with actual data from your API
  const enrollments: Enrollment[] = [
    {
      id: '1',
      user: {
        name: 'John Smith',
        email: 'john.smith@example.com',
        department: 'Quality Control'
      },
      course: {
        title: 'Quality Management Fundamentals',
        instructor: 'Sarah Johnson'
      },
      enrollmentDate: '2024-03-01',
      progress: 75,
      status: 'in_progress',
      dueDate: '2024-04-01'
    },
    {
      id: '2',
      user: {
        name: 'Emily Brown',
        email: 'emily.brown@example.com',
        department: 'Production'
      },
      course: {
        title: 'ISO 9001:2015 Implementation',
        instructor: 'Michael Wilson'
      },
      enrollmentDate: '2024-02-15',
      progress: 100,
      status: 'completed',
      dueDate: '2024-03-15'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Course Enrollments</h1>
          <p className="text-[var(--text-secondary)]">
            Manage user enrollments and track progress
          </p>
        </div>
        <Button 
          icon={<UserPlus size={20} />}
        >
          Enroll User
        </Button>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="w-96">
            <Input
              placeholder="Search enrollments..."
              startIcon={<Search size={20} />}
            />
          </div>
          <div className="flex space-x-2">
            <select className="border border-[var(--divider)] rounded-md px-3 py-2">
              <option value="">All Departments</option>
              <option value="quality">Quality Control</option>
              <option value="production">Production</option>
              <option value="rd">R&D</option>
            </select>
            <select className="border border-[var(--divider)] rounded-md px-3 py-2">
              <option value="">All Status</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="not_started">Not Started</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[var(--divider)]">
            <thead className="bg-[var(--background-paper)]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Course
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Enrollment Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
                  Progress
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
              {enrollments.map((enrollment) => (
                <tr key={enrollment.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium">{enrollment.user.name}</div>
                      <div className="text-sm text-[var(--text-secondary)]">{enrollment.user.department}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium">{enrollment.course.title}</div>
                      <div className="text-sm text-[var(--text-secondary)]">
                        Instructor: {enrollment.course.instructor}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">{enrollment.enrollmentDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">{enrollment.dueDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full bg-[var(--divider)] rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-[var(--primary-main)]"
                        style={{ width: `${enrollment.progress}%` }}
                      />
                    </div>
                    <div className="text-sm text-[var(--text-secondary)] mt-1">
                      {enrollment.progress}% Complete
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${enrollment.status === 'completed' ? 'bg-[var(--success-light)] text-[var(--success-dark)]' :
                        enrollment.status === 'in_progress' ? 'bg-[var(--warning-light)] text-[var(--warning-dark)]' :
                        'bg-[var(--info-light)] text-[var(--info-dark)]'}`}>
                      {enrollment.status.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<BookOpen size={16} />}
                    >
                      View Course
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

export default EnrollmentsPage;
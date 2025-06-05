import React, { useState } from 'react';
import { Plus, Search, Filter, CheckCircle, Clock, Calendar, Users, Tag, X } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import TaskFilters from './TaskFilters';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  assignedTo?: string;
  category: string;
  tags: string[];
  createdAt: string;
}

const TasksPage: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Sample data - replace with actual data from your API
  const tasks: Task[] = [
    {
      id: '1',
      title: 'Review quality documentation',
      description: 'Review and update the quality manual for ISO 9001:2015 compliance',
      status: 'todo',
      priority: 'high',
      dueDate: '2024-03-20',
      assignedTo: 'John Doe',
      category: 'Documentation',
      tags: ['ISO 9001', 'Quality Manual'],
      createdAt: '2024-03-15'
    },
    {
      id: '2',
      title: 'Prepare for supplier audit',
      description: 'Prepare checklist and documentation for upcoming supplier audit',
      status: 'in_progress',
      priority: 'urgent',
      dueDate: '2024-03-18',
      assignedTo: 'Sarah Johnson',
      category: 'Audits',
      tags: ['Supplier', 'Audit'],
      createdAt: '2024-03-14'
    },
    {
      id: '3',
      title: 'Update training records',
      description: 'Update employee training records with recent quality training sessions',
      status: 'completed',
      priority: 'medium',
      dueDate: '2024-03-15',
      assignedTo: 'Michael Brown',
      category: 'Training',
      tags: ['Records', 'Training'],
      createdAt: '2024-03-10'
    }
  ];

  const handleTaskSubmit = (task: Task) => {
    console.log('Task submitted:', task);
    setShowForm(false);
    setSelectedTask(null);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setShowForm(true);
  };

  const handleFilterChange = (filters: any) => {
    console.log('Filters changed:', filters);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Tasks</h1>
          <p className="text-[var(--text-secondary)]">
            Manage and track quality-related tasks and activities
          </p>
        </div>
        <Button 
          icon={<Plus size={20} />}
          onClick={() => {
            setSelectedTask(null);
            setShowForm(true);
          }}
        >
          Add Task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-[var(--warning-light)] text-[var(--warning-dark)]">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="font-medium">To Do</h3>
              <p className="text-2xl font-semibold">5</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-[var(--info-light)] text-[var(--info-dark)]">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="font-medium">In Progress</h3>
              <p className="text-2xl font-semibold">3</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-[var(--success-light)] text-[var(--success-dark)]">
              <CheckCircle size={24} />
            </div>
            <div>
              <h3 className="font-medium">Completed</h3>
              <p className="text-2xl font-semibold">12</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-[var(--error-light)] text-[var(--error-dark)]">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="font-medium">Overdue</h3>
              <p className="text-2xl font-semibold">2</p>
            </div>
          </div>
        </Card>
      </div>

      {showForm && (
        <Card title={selectedTask ? "Edit Task" : "Add New Task"}>
          <TaskForm 
            onSubmit={handleTaskSubmit} 
            initialData={selectedTask || undefined}
            onCancel={() => {
              setShowForm(false);
              setSelectedTask(null);
            }}
          />
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="w-96">
            <Input
              placeholder="Search tasks..."
              startIcon={<Search size={20} />}
            />
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">Export</Button>
            <Button 
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              icon={<Filter size={20} />}
            >
              Filter
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="mb-6">
            <TaskFilters
              onFilterChange={handleFilterChange}
              onReset={() => console.log('Filters reset')}
            />
          </div>
        )}

        <TaskList tasks={tasks} onEdit={handleEditTask} />
      </Card>
    </div>
  );
};

export default TasksPage;
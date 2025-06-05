import React from 'react';
import { Edit, Trash2, CheckCircle, Clock, Calendar, User, Tag } from 'lucide-react';
import Button from '../ui/Button';

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

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onEdit }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-[var(--info-light)] text-[var(--info-dark)]';
      case 'medium':
        return 'bg-[var(--warning-light)] text-[var(--warning-dark)]';
      case 'high':
        return 'bg-[var(--error-light)] text-[var(--error-dark)]';
      case 'urgent':
        return 'bg-[var(--error-main)] text-white';
      default:
        return 'bg-[var(--primary-light)] text-[var(--primary-dark)]';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-[var(--warning-light)] text-[var(--warning-dark)]';
      case 'in_progress':
        return 'bg-[var(--info-light)] text-[var(--info-dark)]';
      case 'completed':
        return 'bg-[var(--success-light)] text-[var(--success-dark)]';
      default:
        return 'bg-[var(--primary-light)] text-[var(--primary-dark)]';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo':
        return <Clock size={16} />;
      case 'in_progress':
        return <Clock size={16} />;
      case 'completed':
        return <CheckCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="p-4 border border-[var(--divider)] rounded-lg hover:border-[var(--primary-main)] transition-colors"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-medium">{task.title}</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
                <span className={`flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                  {getStatusIcon(task.status)}
                  <span className="ml-1">{formatStatus(task.status)}</span>
                </span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-2">
                {task.description}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                icon={<Edit size={16} />}
                onClick={() => onEdit(task)}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                icon={<Trash2 size={16} />}
              >
                Delete
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center mt-4 text-sm text-[var(--text-secondary)]">
            <div className="flex items-center mr-4 mb-2">
              <Calendar size={16} className="mr-1" />
              Due: {task.dueDate}
            </div>
            {task.assignedTo && (
              <div className="flex items-center mr-4 mb-2">
                <User size={16} className="mr-1" />
                {task.assignedTo}
              </div>
            )}
            <div className="flex items-center mr-4 mb-2">
              <Tag size={16} className="mr-1" />
              {task.category}
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {task.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 text-xs rounded-full bg-[var(--primary-light)] text-[var(--primary-dark)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
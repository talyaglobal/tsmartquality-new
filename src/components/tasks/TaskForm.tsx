import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar, Clock, Tag, User, Plus, X } from 'lucide-react';
import Input from '../ui/Input';
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

interface TaskFormProps {
  onSubmit: (data: Task) => void;
  initialData?: Partial<Task>;
  onCancel: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, initialData, onCancel }) => {
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  
  const { register, handleSubmit, formState: { errors } } = useForm<Task>({
    defaultValues: {
      ...initialData,
      status: initialData?.status || 'todo',
      priority: initialData?.priority || 'medium',
      dueDate: initialData?.dueDate || new Date().toISOString().split('T')[0],
      createdAt: initialData?.createdAt || new Date().toISOString().split('T')[0]
    }
  });

  const handleFormSubmit = (data: any) => {
    onSubmit({
      ...data,
      id: initialData?.id || Date.now().toString(),
      tags
    });
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Sample users for assignment
  const users = [
    { id: '1', name: 'John Doe' },
    { id: '2', name: 'Sarah Johnson' },
    { id: '3', name: 'Michael Brown' },
    { id: '4', name: 'Emily Davis' }
  ];

  // Sample categories
  const categories = [
    'Documentation',
    'Audits',
    'Training',
    'Complaints',
    'Maintenance',
    'Quality Control',
    'Compliance'
  ];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Input
        label="Task Title"
        error={errors.title?.message}
        {...register('title', { required: 'Task title is required' })}
      />

      <Input
        label="Description"
        multiline
        rows={3}
        error={errors.description?.message}
        {...register('description', { required: 'Description is required' })}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Status
          </label>
          <select
            className="w-full border border-[var(--divider)] rounded-md p-2"
            {...register('status', { required: 'Status is required' })}
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-[var(--error-main)]">{errors.status.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Priority
          </label>
          <select
            className="w-full border border-[var(--divider)] rounded-md p-2"
            {...register('priority', { required: 'Priority is required' })}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
          {errors.priority && (
            <p className="mt-1 text-sm text-[var(--error-main)]">{errors.priority.message}</p>
          )}
        </div>

        <Input
          label="Due Date"
          type="date"
          error={errors.dueDate?.message}
          {...register('dueDate', { required: 'Due date is required' })}
          startIcon={<Calendar size={20} />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Assigned To
          </label>
          <select
            className="w-full border border-[var(--divider)] rounded-md p-2"
            {...register('assignedTo')}
          >
            <option value="">Unassigned</option>
            {users.map(user => (
              <option key={user.id} value={user.name}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Category
          </label>
          <select
            className="w-full border border-[var(--divider)] rounded-md p-2"
            {...register('category', { required: 'Category is required' })}
          >
            <option value="">Select Category</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-[var(--error-main)]">{errors.category.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
          Tags
        </label>
        <div className="flex items-center space-x-2 mb-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add a tag"
            startIcon={<Tag size={20} />}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={addTag}
            icon={<Plus size={20} />}
          >
            Add
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag, index) => (
              <div
                key={index}
                className="flex items-center px-3 py-1 rounded-full bg-[var(--primary-light)] text-[var(--primary-dark)]"
              >
                <span className="text-sm">{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-2 text-[var(--primary-dark)] hover:text-[var(--primary-main)]"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit">
          {initialData?.id ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
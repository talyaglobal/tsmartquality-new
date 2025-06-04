import React from 'react';
import { useForm } from 'react-hook-form';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface CustomerFormData {
  name: string;
  code: string;
  category: 'cash-cow' | 'star' | 'problem-child' | 'dog';
  rating: 1 | 2 | 3 | 4 | 5;
  strategic: boolean;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

interface CustomerFormProps {
  onSubmit: (data: CustomerFormData) => void;
  initialData?: Partial<CustomerFormData>;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ onSubmit, initialData }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<CustomerFormData>({
    defaultValues: initialData
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Customer Name"
          error={errors.name?.message}
          {...register('name', { required: 'Customer name is required' })}
        />
        <Input
          label="Customer Code"
          error={errors.code?.message}
          {...register('code', { required: 'Customer code is required' })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Category
          </label>
          <select
            className="w-full border border-[var(--divider)] rounded-md p-2"
            {...register('category', { required: 'Category is required' })}
          >
            <option value="">Select Category</option>
            <option value="cash-cow">Cash Cow</option>
            <option value="star">Star</option>
            <option value="problem-child">Problem Child</option>
            <option value="dog">Dog</option>
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-[var(--error-main)]">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Rating
          </label>
          <select
            className="w-full border border-[var(--divider)] rounded-md p-2"
            {...register('rating', { required: 'Rating is required' })}
          >
            <option value="">Select Rating</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
          {errors.rating && (
            <p className="mt-1 text-sm text-[var(--error-main)]">{errors.rating.message}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="strategic"
            {...register('strategic')}
            className="w-4 h-4 text-[var(--primary-main)] border-[var(--divider)] rounded focus:ring-[var(--primary-main)]"
          />
          <label htmlFor="strategic" className="text-sm font-medium text-[var(--text-secondary)]">
            Strategic Account
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Input
          label="Contact Person"
          error={errors.contactPerson?.message}
          {...register('contactPerson', { required: 'Contact person is required' })}
        />
        <Input
          label="Email"
          type="email"
          error={errors.email?.message}
          {...register('email', { 
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address'
            }
          })}
        />
        <Input
          label="Phone"
          error={errors.phone?.message}
          {...register('phone', { required: 'Phone is required' })}
        />
      </div>

      <Input
        label="Address"
        multiline
        rows={3}
        error={errors.address?.message}
        {...register('address', { required: 'Address is required' })}
      />

      <Input
        label="Notes"
        multiline
        rows={3}
        error={errors.notes?.message}
        {...register('notes')}
      />

      <div className="flex justify-end space-x-2">
        <Button variant="outline" type="button">
          Cancel
        </Button>
        <Button type="submit">
          Save Customer
        </Button>
      </div>
    </form>
  );
};

export default CustomerForm;
import React from 'react';
import { useForm } from 'react-hook-form';
import Input from '../../ui/Input';
import Button from '../../ui/Button';

interface LocationFormData {
  name: string;
  code: string;
  type: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude: string;
  longitude: string;
  capacity: number;
  manager: string;
  phone: string;
  email: string;
}

interface LocationFormProps {
  onSubmit: (data: LocationFormData) => void;
  initialData?: Partial<LocationFormData>;
  onCancel: () => void;
}

const LocationForm: React.FC<LocationFormProps> = ({ onSubmit, initialData, onCancel }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<LocationFormData>({
    defaultValues: initialData
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Location Name"
          error={errors.name?.message}
          {...register('name', { required: 'Location name is required' })}
        />
        <Input
          label="Location Code"
          error={errors.code?.message}
          {...register('code', { required: 'Location code is required' })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
          Location Type
        </label>
        <select
          className="w-full border border-[var(--divider)] rounded-md p-2"
          {...register('type', { required: 'Location type is required' })}
        >
          <option value="">Select Type</option>
          <option value="distribution">Distribution Center</option>
          <option value="fulfillment">Fulfillment Center</option>
          <option value="warehouse">Warehouse</option>
        </select>
        {errors.type && (
          <p className="mt-1 text-sm text-[var(--error-main)]">{errors.type.message}</p>
        )}
      </div>

      <Input
        label="Address"
        error={errors.address?.message}
        {...register('address', { required: 'Address is required' })}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Input
          label="City"
          error={errors.city?.message}
          {...register('city', { required: 'City is required' })}
        />
        <Input
          label="State/Province"
          error={errors.state?.message}
          {...register('state', { required: 'State is required' })}
        />
        <Input
          label="Postal Code"
          error={errors.postalCode?.message}
          {...register('postalCode', { required: 'Postal code is required' })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Input
          label="Country"
          error={errors.country?.message}
          {...register('country', { required: 'Country is required' })}
        />
        <Input
          label="Latitude"
          error={errors.latitude?.message}
          {...register('latitude', { required: 'Latitude is required' })}
        />
        <Input
          label="Longitude"
          error={errors.longitude?.message}
          {...register('longitude', { required: 'Longitude is required' })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Input
          label="Storage Capacity (sq ft)"
          type="number"
          error={errors.capacity?.message}
          {...register('capacity', { required: 'Capacity is required' })}
        />
        <Input
          label="Manager Name"
          error={errors.manager?.message}
          {...register('manager', { required: 'Manager name is required' })}
        />
        <Input
          label="Contact Phone"
          error={errors.phone?.message}
          {...register('phone', { required: 'Phone is required' })}
        />
      </div>

      <Input
        label="Contact Email"
        type="email"
        error={errors.email?.message}
        {...register('email', { required: 'Email is required' })}
      />

      <div className="flex justify-end space-x-2">
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Location
        </Button>
      </div>
    </form>
  );
};

export default LocationForm;
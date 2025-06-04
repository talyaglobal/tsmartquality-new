import React from 'react'
import { useForm } from 'react-hook-form'
import Input from '../ui/Input'
import Button from '../ui/Button'

interface SupplierFormData {
  name: string
  code: string
  category: string
  type: 'preferred' | 'regular' | 'blacklist'
  contactPerson: string
  email: string
  phone: string
  address: string
  country: string
  state: string
  city: string
  qualityCertifications: string
  rating: string
  status: string
  reasonForType?: string
}

interface SupplierFormProps {
  onSubmit: (data: SupplierFormData) => void
  initialData?: Partial<SupplierFormData>
}

const SupplierForm: React.FC<SupplierFormProps> = ({ onSubmit, initialData }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<SupplierFormData>({
    defaultValues: initialData
  })

  const selectedType = watch('type')
  const selectedCountry = watch('country')

  // Sample data - replace with actual data from your API
  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' }
  ]

  const states = {
    US: ['California', 'New York', 'Texas', 'Florida'],
    GB: ['England', 'Scotland', 'Wales', 'Northern Ireland'],
    DE: ['Bavaria', 'Berlin', 'Hamburg', 'Hesse'],
    FR: ['Île-de-France', 'Provence-Alpes-Côte d\'Azur', 'Occitanie'],
    IT: ['Lombardy', 'Lazio', 'Tuscany', 'Veneto'],
    ES: ['Madrid', 'Catalonia', 'Andalusia', 'Valencia']
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Supplier Name"
          error={errors.name?.message}
          {...register('name', { required: 'Supplier name is required' })}
        />
        <Input
          label="Supplier Code"
          error={errors.code?.message}
          {...register('code', { required: 'Supplier code is required' })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Category"
          error={errors.category?.message}
          {...register('category', { required: 'Category is required' })}
        />
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Supplier Type
          </label>
          <select
            className="w-full border border-[var(--divider)] rounded-md p-2"
            {...register('type', { required: 'Supplier type is required' })}
          >
            <option value="">Select Type</option>
            <option value="preferred">Preferred Supplier</option>
            <option value="regular">Regular Supplier</option>
            <option value="blacklist">Blacklisted</option>
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-[var(--error-main)]">{errors.type.message}</p>
          )}
        </div>
      </div>

      {selectedType === 'blacklist' && (
        <Input
          label="Reason for Blacklisting"
          multiline
          rows={3}
          error={errors.reasonForType?.message}
          {...register('reasonForType', { 
            required: 'Reason for blacklisting is required'
          })}
        />
      )}

      {selectedType === 'preferred' && (
        <Input
          label="Reason for Preferred Status"
          multiline
          rows={3}
          error={errors.reasonForType?.message}
          {...register('reasonForType', { 
            required: 'Reason for preferred status is required'
          })}
        />
      )}

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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Country
          </label>
          <select
            className="w-full border border-[var(--divider)] rounded-md p-2"
            {...register('country', { required: 'Country is required' })}
          >
            <option value="">Select Country</option>
            {countries.map(country => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
          {errors.country && (
            <p className="mt-1 text-sm text-[var(--error-main)]">{errors.country.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            State/Region
          </label>
          <select
            className="w-full border border-[var(--divider)] rounded-md p-2"
            {...register('state')}
            disabled={!selectedCountry}
          >
            <option value="">Select State/Region</option>
            {selectedCountry && states[selectedCountry as keyof typeof states]?.map(state => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
        <Input
          label="City"
          {...register('city')}
        />
      </div>

      <Input
        label="Address"
        multiline
        rows={3}
        error={errors.address?.message}
        {...register('address', { required: 'Address is required' })}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Quality Certifications"
          multiline
          rows={3}
          error={errors.qualityCertifications?.message}
          {...register('qualityCertifications', { required: 'Quality certifications are required' })}
        />
        <Input
          label="Rating"
          error={errors.rating?.message}
          {...register('rating', { required: 'Rating is required' })}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" type="button">
          Cancel
        </Button>
        <Button type="submit">
          Save Supplier
        </Button>
      </div>
    </form>
  )
}

export default SupplierForm
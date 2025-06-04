import React from 'react'
import { useForm } from 'react-hook-form'
import Input from '../ui/Input'
import Button from '../ui/Button'

interface ServiceFormData {
  name: string
  code: string
  category: string
  description: string
  specifications: string
  status: string
}

interface ServiceFormProps {
  onSubmit: (data: ServiceFormData) => void
  initialData?: Partial<ServiceFormData>
}

const ServiceForm: React.FC<ServiceFormProps> = ({ onSubmit, initialData }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<ServiceFormData>({
    defaultValues: initialData
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Service Name"
          error={errors.name?.message}
          {...register('name', { required: 'Service name is required' })}
        />
        <Input
          label="Service Code"
          error={errors.code?.message}
          {...register('code', { required: 'Service code is required' })}
        />
      </div>

      <Input
        label="Description"
        multiline
        rows={4}
        error={errors.description?.message}
        {...register('description', { required: 'Description is required' })}
      />

      <Input
        label="Specifications"
        multiline
        rows={4}
        error={errors.specifications?.message}
        {...register('specifications', { required: 'Specifications are required' })}
      />

      <Input
        label="Status"
        error={errors.status?.message}
        {...register('status', { required: 'Status is required' })}
      />

      <div className="flex justify-end space-x-2">
        <Button variant="outline" type="button">
          Cancel
        </Button>
        <Button type="submit">
          Save Service
        </Button>
      </div>
    </form>
  )
}

export default ServiceForm
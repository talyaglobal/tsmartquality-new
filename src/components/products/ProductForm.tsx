import React from 'react'
import { useForm } from 'react-hook-form'
import Input from '../ui/Input'
import Button from '../ui/Button'

interface ProductFormData {
  name: string
  code: string
  description: string
  specifications: string
  status: string
}

interface ProductFormProps {
  onSubmit: (data: ProductFormData) => void
  initialData?: Partial<ProductFormData>
}

const ProductForm: React.FC<ProductFormProps> = ({ onSubmit, initialData }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormData>({
    defaultValues: initialData
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Product Name"
          error={errors.name?.message}
          {...register('name', { required: 'Product name is required' })}
        />
        <Input
          label="Product Code"
          error={errors.code?.message}
          {...register('code', { required: 'Product code is required' })}
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
          Save Product
        </Button>
      </div>
    </form>
  )
}

export default ProductForm
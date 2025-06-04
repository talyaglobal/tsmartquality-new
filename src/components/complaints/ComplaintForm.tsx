import React from 'react'
import { useForm } from 'react-hook-form'
import { Upload } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import Input from '../ui/Input'
import Button from '../ui/Button'

interface ComplaintFormData {
  customerName: string
  productName: string
  complaintDescription: string
  priority: string
  assignedTo: string
  attachments: File[]
}

interface ComplaintFormProps {
  onSubmit: (data: ComplaintFormData) => void
  initialData?: Partial<ComplaintFormData>
}

const ComplaintForm: React.FC<ComplaintFormProps> = ({ onSubmit, initialData }) => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ComplaintFormData>({
    defaultValues: initialData
  })

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: files => {
      setValue('attachments', files)
    },
    multiple: true
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Customer Name"
          error={errors.customerName?.message}
          {...register('customerName', { required: 'Customer name is required' })}
        />
        <Input
          label="Product Name"
          error={errors.productName?.message}
          {...register('productName', { required: 'Product name is required' })}
        />
      </div>

      <Input
        label="Complaint Description"
        multiline
        rows={4}
        error={errors.complaintDescription?.message}
        {...register('complaintDescription', { required: 'Description is required' })}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Priority"
          error={errors.priority?.message}
          {...register('priority', { required: 'Priority is required' })}
        />
        <Input
          label="Assigned To"
          error={errors.assignedTo?.message}
          {...register('assignedTo', { required: 'Assignment is required' })}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--text-secondary)]">
          Attachments
        </label>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-[var(--primary-main)] bg-[var(--primary-main)] bg-opacity-5' : 'border-[var(--divider)]'}`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-[var(--text-secondary)]" />
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {isDragActive ? 'Drop the files here' : 'Drag & drop files here, or click to select'}
          </p>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            You can upload multiple files
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" type="button">
          Cancel
        </Button>
        <Button type="submit">
          Submit Complaint
        </Button>
      </div>
    </form>
  )
}

export default ComplaintForm
import React from 'react'
import { useForm } from 'react-hook-form'
import { Upload } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import Input from '../ui/Input'
import Button from '../ui/Button'

interface DocumentFormData {
  name: string
  documentNumber: string
  type: string
  unit: string
  publicationDate: string
  revisionNumber: string
  revisionReason: string
  brcRelevant: boolean
  file: File | null
}

interface DocumentFormProps {
  onSubmit: (data: DocumentFormData) => void
  initialData?: Partial<DocumentFormData>
}

const DocumentForm: React.FC<DocumentFormProps> = ({ onSubmit, initialData }) => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<DocumentFormData>({
    defaultValues: initialData
  })

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: files => {
      setValue('file', files[0])
    }
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Document Name"
          error={errors.name?.message}
          {...register('name', { required: 'Document name is required' })}
        />
        <Input
          label="Document Number"
          error={errors.documentNumber?.message}
          {...register('documentNumber', { required: 'Document number is required' })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Document Type"
          error={errors.type?.message}
          {...register('type', { required: 'Document type is required' })}
        />
        <Input
          label="Unit"
          error={errors.unit?.message}
          {...register('unit', { required: 'Unit is required' })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Publication Date"
          type="date"
          error={errors.publicationDate?.message}
          {...register('publicationDate', { required: 'Publication date is required' })}
        />
        <Input
          label="Revision Number"
          type="number"
          error={errors.revisionNumber?.message}
          {...register('revisionNumber', { required: 'Revision number is required' })}
        />
      </div>

      <Input
        label="Revision Reason"
        multiline
        rows={4}
        error={errors.revisionReason?.message}
        {...register('revisionReason', { required: 'Revision reason is required' })}
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-[var(--text-secondary)]">
          Document File
        </label>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-[var(--primary-main)] bg-[var(--primary-main)] bg-opacity-5' : 'border-[var(--divider)]'}`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto h-12 w-12 text-[var(--text-secondary)]" />
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {isDragActive ? 'Drop the file here' : 'Drag & drop a file here, or click to select'}
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" type="button">
          Cancel
        </Button>
        <Button type="submit">
          Save Document
        </Button>
      </div>
    </form>
  )
}

export default DocumentForm
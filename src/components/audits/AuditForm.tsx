import React from 'react'
import { useForm } from 'react-hook-form'
import Input from '../ui/Input'
import Button from '../ui/Button'

interface AuditFormData {
  title: string
  type: string
  scope: string
  auditDate: string
  auditor: string
  department: string
  description: string
  standard?: string
  auditType: 'internal' | 'external' | 'supplier'
  auditStandard?: string
  auditTeam?: string[]
  expectedDuration?: string
  previousFindings?: string
}

interface AuditFormProps {
  onSubmit: (data: AuditFormData) => void
  initialData?: Partial<AuditFormData>
}

const AuditForm: React.FC<AuditFormProps> = ({ onSubmit, initialData }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<AuditFormData>({
    defaultValues: initialData
  })

  const auditType = watch('auditType')

  const auditStandards = {
    internal: [
      'ISO 9001:2015',
      'HACCP',
      'GMP',
      'Internal Quality Standards'
    ],
    external: [
      'ISO 9001:2015',
      'ISO 22000:2018',
      'BRC',
      'IFS',
      'FSSC 22000'
    ],
    supplier: [
      'Supplier Quality Assessment',
      'GMP',
      'GFSI Standards',
      'Custom Supplier Requirements'
    ]
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Audit Title"
          error={errors.title?.message}
          {...register('title', { required: 'Audit title is required' })}
        />
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            Audit Type
          </label>
          <select
            className="w-full border border-[var(--divider)] rounded-md p-2"
            {...register('auditType', { required: 'Audit type is required' })}
          >
            <option value="">Select Audit Type</option>
            <option value="internal">Internal Audit</option>
            <option value="external">External Audit</option>
            <option value="supplier">Supplier Audit</option>
          </select>
          {errors.auditType && (
            <p className="mt-1 text-sm text-[var(--error-main)]">{errors.auditType.message}</p>
          )}
        </div>
      </div>

      {auditType && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Audit Standard
            </label>
            <select
              className="w-full border border-[var(--divider)] rounded-md p-2"
              {...register('auditStandard', { required: 'Audit standard is required' })}
            >
              <option value="">Select Standard</option>
              {auditStandards[auditType].map((standard) => (
                <option key={standard} value={standard}>
                  {standard}
                </option>
              ))}
            </select>
            {errors.auditStandard && (
              <p className="mt-1 text-sm text-[var(--error-main)]">{errors.auditStandard.message}</p>
            )}
          </div>
          <Input
            label="Expected Duration"
            type="text"
            placeholder="e.g., 2 days"
            error={errors.expectedDuration?.message}
            {...register('expectedDuration', { required: 'Duration is required' })}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Department"
          error={errors.department?.message}
          {...register('department', { required: 'Department is required' })}
        />
        <Input
          label="Auditor"
          error={errors.auditor?.message}
          {...register('auditor', { required: 'Auditor name is required' })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Audit Date"
          type="date"
          error={errors.auditDate?.message}
          {...register('auditDate', { required: 'Audit date is required' })}
        />
        <Input
          label="Scope"
          error={errors.scope?.message}
          {...register('scope', { required: 'Scope is required' })}
        />
      </div>

      <Input
        label="Description"
        multiline
        rows={4}
        error={errors.description?.message}
        {...register('description', { required: 'Description is required' })}
      />

      {auditType && (
        <Input
          label="Previous Findings"
          multiline
          rows={4}
          placeholder="Enter any relevant previous audit findings"
          {...register('previousFindings')}
        />
      )}

      <div className="flex justify-end space-x-2">
        <Button variant="outline" type="button">
          Cancel
        </Button>
        <Button type="submit">
          Schedule Audit
        </Button>
      </div>
    </form>
  )
}

export default AuditForm
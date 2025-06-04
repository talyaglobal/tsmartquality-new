import React, { forwardRef } from 'react'
import { classNames } from '@/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  fullWidth?: boolean
  startIcon?: React.ReactNode
  endIcon?: React.ReactNode
  multiline?: boolean
  rows?: number
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    fullWidth = false, 
    startIcon, 
    endIcon, 
    className,
    multiline,
    rows = 3,
    ...props 
  }, ref) => {
    const inputClasses = classNames(
      'input-field w-full',
      {
        'pl-10': startIcon,
        'pr-10': endIcon,
        'border-[var(--error-main)]': error,
      },
      className
    )

    const renderInput = () => {
      if (multiline) {
        return (
          <textarea
            className={inputClasses}
            rows={rows}
            {...props as any}
          />
        )
      }

      return (
        <input
          ref={ref}
          className={inputClasses}
          {...props}
        />
      )
    }

    return (
      <div className={classNames('mb-4', { 'w-full': fullWidth })}>
        {label && (
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {startIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-secondary)]">
              {startIcon}
            </div>
          )}
          {renderInput()}
          {endIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[var(--text-secondary)]">
              {endIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-[var(--error-main)]">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
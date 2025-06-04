import React from 'react'
import { classNames } from '@/utils'

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'outline'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  children,
  className,
  ...props
}) => {
  const baseClasses = 'font-medium rounded-md transition-all flex items-center justify-center'

  const variantClasses = {
    'btn-primary': variant === 'primary',
    'btn-secondary': variant === 'secondary',
    'btn-success': variant === 'success',
    'btn-danger': variant === 'danger',
    'btn-warning': variant === 'warning',
    'btn-info': variant === 'info',
    'border border-[var(--primary-main)] text-[var(--primary-main)] hover:bg-[var(--primary-main)] hover:bg-opacity-10': 
      variant === 'outline',
  }

  const sizeClasses = {
    'py-1 px-2 text-sm': size === 'sm',
    'py-2 px-4 text-base': size === 'md',
    'py-3 px-6 text-lg': size === 'lg',
  }

  const widthClasses = {
    'w-full': fullWidth,
  }

  return (
    <button
      className={classNames(
        baseClasses,
        variantClasses,
        sizeClasses,
        widthClasses,
        className
      )}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  )
}

export default Button
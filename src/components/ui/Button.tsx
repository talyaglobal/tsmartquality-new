import React from 'react';
import { classNames } from '@/utils';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  loading?: boolean;
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  loading = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = 'font-medium rounded-md transition-all flex items-center justify-center';

  const variantClasses = {
    'bg-[var(--primary-main)] hover:bg-[var(--primary-dark)] text-white': variant === 'primary',
    'bg-[var(--secondary-main)] hover:bg-[var(--secondary-dark)] text-white': variant === 'secondary',
    'bg-[var(--success-main)] hover:bg-[var(--success-dark)] text-white': variant === 'success',
    'bg-[var(--error-main)] hover:bg-[var(--error-dark)] text-white': variant === 'danger',
    'bg-[var(--warning-main)] hover:bg-[var(--warning-dark)] text-white': variant === 'warning',
    'bg-[var(--info-main)] hover:bg-[var(--info-dark)] text-white': variant === 'info',
    'border border-[var(--primary-main)] text-[var(--primary-main)] hover:bg-[var(--primary-main)] hover:bg-opacity-10': 
      variant === 'outline',
  };

  const sizeClasses = {
    'py-1 px-2 text-sm': size === 'sm',
    'py-2 px-4 text-base': size === 'md',
    'py-3 px-6 text-lg': size === 'lg',
  };

  const widthClasses = {
    'w-full': fullWidth,
  };

  const disabledClasses = (disabled || loading) ? 'opacity-60 cursor-not-allowed' : '';

  return (
    <button
      className={classNames(
        baseClasses,
        variantClasses,
        sizeClasses,
        widthClasses,
        disabledClasses,
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} className="mr-2 animate-spin" />
          {children}
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
import React from 'react'
import { classNames } from '@/utils'

interface CardProps {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  bodyClassName?: string
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  actions,
  children,
  className,
  bodyClassName,
}) => {
  return (
    <div className={classNames('card', className)}>
      {(title || actions) && (
        <div className="flex justify-between items-center mb-4">
          <div>
            {title && <h5 className="font-medium">{title}</h5>}
            {subtitle && <p className="text-[var(--text-secondary)] text-sm mt-1">{subtitle}</p>}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className={classNames(bodyClassName)}>
        {children}
      </div>
    </div>
  )
}

export default Card
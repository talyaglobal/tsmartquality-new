import React from 'react'
import { X } from 'lucide-react'

interface FilterBadge {
  id: string
  label: string
  count: number
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info'
  onClick?: () => void
}

interface FilterBadgesProps {
  badges: FilterBadge[]
  onClear?: (id: string) => void
}

const FilterBadges: React.FC<FilterBadgesProps> = ({ badges, onClear }) => {
  const getColorClasses = (color: string = 'primary') => {
    switch (color) {
      case 'success':
        return 'bg-[var(--success-light)] text-[var(--success-dark)]'
      case 'warning':
        return 'bg-[var(--warning-light)] text-[var(--warning-dark)]'
      case 'error':
        return 'bg-[var(--error-light)] text-[var(--error-dark)]'
      case 'info':
        return 'bg-[var(--info-light)] text-[var(--info-dark)]'
      default:
        return 'bg-[var(--primary-light)] text-[var(--primary-dark)]'
    }
  }

  if (badges.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {badges.map((badge) => (
        <div
          key={badge.id}
          className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getColorClasses(badge.color)}`}
          onClick={badge.onClick}
          role={badge.onClick ? 'button' : undefined}
        >
          <span>{badge.label}</span>
          <span className="ml-2 px-1.5 py-0.5 bg-white bg-opacity-20 rounded-full">
            {badge.count}
          </span>
          {onClear && (
            <button
              className="ml-2 hover:text-current/80"
              onClick={(e) => {
                e.stopPropagation()
                onClear(badge.id)
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

export default FilterBadges
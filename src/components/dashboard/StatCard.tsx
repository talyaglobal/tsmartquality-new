import React from 'react';
import Card from '../ui/Card';
import classNames from 'classnames';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down';
  };
  icon: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'info' | 'error';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  variant = 'primary',
}) => {
  const getVariantColor = () => {
    switch (variant) {
      case 'primary':
        return 'bg-[var(--primary-main)] text-white';
      case 'success':
        return 'bg-[var(--success-main)] text-white';
      case 'warning':
        return 'bg-[var(--warning-main)] text-white';
      case 'info':
        return 'bg-[var(--info-main)] text-white';
      case 'error':
        return 'bg-[var(--error-main)] text-white';
      default:
        return 'bg-[var(--primary-main)] text-white';
    }
  };

  return (
    <Card className="h-full">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[var(--text-secondary)] mb-1">{title}</p>
          <h4 className="text-2xl font-semibold mb-1">{value}</h4>
          {change && (
            <div className="flex items-center">
              <span
                className={classNames('text-sm', {
                  'text-[var(--success-main)]': change.trend === 'up',
                  'text-[var(--error-main)]': change.trend === 'down',
                })}
              >
                {change.trend === 'up' ? '+' : '-'}{Math.abs(change.value)}%
              </span>
              <span className="text-xs text-[var(--text-secondary)] ml-1">vs last period</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${getVariantColor()}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { classNames } from '@/utils';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  defaultExpanded?: boolean;
  collapsed?: boolean;
}

export const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  active,
  onClick,
  children,
  defaultExpanded = false,
  collapsed = false
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const handleClick = () => {
    if (children) {
      setExpanded(!expanded);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <div>
      <div
        className={classNames(
          'flex items-center py-2 px-4 rounded-md cursor-pointer transition-all duration-200 mb-1',
          {
            'bg-[var(--primary-main)] text-white': active,
            'text-[var(--text-secondary)] hover:bg-[var(--primary-light)] hover:bg-opacity-5 hover:text-[var(--primary-main)]': !active,
            'justify-center': collapsed
          }
        )}
        onClick={handleClick}
      >
        <span className={collapsed ? '' : 'mr-3'}>{icon}</span>
        {!collapsed && (
          <>
            <span className="font-medium flex-1">{label}</span>
            {children && (
              <ChevronDown
                size={16}
                className={`transform transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
              />
            )}
          </>
        )}
      </div>
      {children && !collapsed && (
        <div
          className={classNames(
            'ml-4 pl-4 border-l border-[var(--divider)] overflow-hidden transition-all duration-200',
            {
              'max-h-0 opacity-0': !expanded,
              'max-h-[500px] opacity-100': expanded
            }
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
};
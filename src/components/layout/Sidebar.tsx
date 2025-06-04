import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  Box,
  FileText,
  AlertTriangle,
  ClipboardCheck,
  Users,
  Settings,
  Moon,
  Sun,
  BarChart2,
  Wrench,
  Target,
  LineChart
} from 'lucide-react';
import { NavItem } from '../ui/NavItem';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div
      className={`h-screen bg-[var(--background-paper)] transition-all duration-300 border-r border-[var(--divider)] flex flex-col
        ${collapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--divider)]">
        {!collapsed && (
          <div className="flex items-center">
            <Box className="text-[var(--primary-main)] w-8 h-8" />
            <h2 className="text-[var(--primary-main)] font-bold ml-2">TSmart Quality</h2>
          </div>
        )}
        <button
          className="p-2 rounded-md hover:bg-[var(--primary-main)] hover:bg-opacity-10 text-[var(--text-secondary)] hover:text-[var(--primary-main)] transition-colors duration-200"
          onClick={onToggle}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 overflow-y-auto">
        {/* Dashboards Section */}
        <div className="mb-6">
          <div className="px-4 mb-2">
            <span className="text-xs font-medium text-[var(--text-secondary)] uppercase">
              {!collapsed && 'Dashboards'}
            </span>
          </div>
          <NavItem
            icon={<BarChart2 size={20} />}
            label="Dashboards"
            collapsed={collapsed}
            defaultExpanded={true}
          >
            <NavItem
              icon={<Target size={18} />}
              label="Quality Score"
              active={isActive('/quality-score')}
              onClick={() => navigate('/quality-score')}
              collapsed={collapsed}
            />
            <NavItem
              icon={<LineChart size={18} />}
              label="Product Dashboard"
              active={isActive('/products/dashboard')}
              onClick={() => navigate('/products/dashboard')}
              collapsed={collapsed}
            />
          </NavItem>
        </div>

        {/* Main Navigation */}
        <div className="mb-6">
          <div className="px-4 mb-2">
            <span className="text-xs font-medium text-[var(--text-secondary)] uppercase">
              {!collapsed && 'Main'}
            </span>
          </div>

          <NavItem
            icon={<Box size={20} />}
            label="Products"
            active={isActive('/products')}
            onClick={() => navigate('/products')}
            collapsed={collapsed}
          />

          <NavItem
            icon={<Wrench size={20} />}
            label="Services"
            active={isActive('/services')}
            onClick={() => navigate('/services')}
            collapsed={collapsed}
          />

          <NavItem
            icon={<FileText size={20} />}
            label="Documents"
            active={isActive('/documents')}
            onClick={() => navigate('/documents')}
            collapsed={collapsed}
          />

          <NavItem
            icon={<AlertTriangle size={20} />}
            label="Complaints"
            active={isActive('/complaints')}
            onClick={() => navigate('/complaints')}
            collapsed={collapsed}
          />

          <NavItem
            icon={<ClipboardCheck size={20} />}
            label="Audits"
            active={isActive('/audits')}
            onClick={() => navigate('/audits')}
            collapsed={collapsed}
          />

          <NavItem
            icon={<Users size={20} />}
            label="Suppliers"
            active={isActive('/suppliers')}
            onClick={() => navigate('/suppliers')}
            collapsed={collapsed}
          />
        </div>
      </div>

      {/* Theme Toggle */}
      <div className="p-4 border-t border-[var(--divider)]">
        <button
          className="flex items-center w-full p-2 rounded-md hover:bg-[var(--primary-main)] hover:bg-opacity-10 text-[var(--text-secondary)] hover:text-[var(--primary-main)] transition-colors duration-200"
          onClick={toggleTheme}
        >
          {document.documentElement.getAttribute('data-theme') === 'dark' ? 
            <Sun size={20} /> : 
            <Moon size={20} />
          }
          {!collapsed && <span className="ml-2">Theme</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
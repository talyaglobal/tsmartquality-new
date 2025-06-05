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
  Utensils,
  Truck,
  Warehouse,
  ShoppingBag,
  Store,
  ShoppingBasket,
  PackageSearch,
  Boxes,
  Image,
  Video,
  Sticker,
  QrCode,
  Package,
  LineChart,
  Layers,
  GraduationCap,
  BookOpen,
  Award,
  UserPlus,
  MapPin,
  Grid,
  Link2,
  Calculator,
  DollarSign,
  BookOpenCheck,
  LayoutDashboard,
  Wrench,
  Bell,
  UserCheck,
  CheckSquare
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
        {collapsed && (
          <Box className="text-[var(--primary-main)] w-8 h-8 mx-auto" />
        )}
        <button
          className={`p-2 rounded-md hover:bg-[var(--primary-main)] hover:bg-opacity-10 text-[var(--text-secondary)] hover:text-[var(--primary-main)] transition-colors duration-200 ${collapsed ? 'mx-auto' : ''}`}
          onClick={onToggle}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 overflow-y-auto">
        {/* Dashboards Section */}
        <NavItem
          icon={<LayoutDashboard size={20} />}
          label="Dashboards"
          collapsed={collapsed}
        >
          <NavItem
            icon={<BarChart2 size={18} />}
            label="Quality Dashboard"
            active={isActive('/dashboard')}
            onClick={() => navigate('/dashboard')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<LineChart size={18} />}
            label="Quality Score"
            active={isActive('/quality-score')}
            onClick={() => navigate('/quality-score')}
            collapsed={collapsed}
          />
        </NavItem>

        {/* Main Navigation */}
        <NavItem
          icon={<Layers size={20} />}
          label="Main"
          collapsed={collapsed}
        >
          <NavItem
            icon={<Box size={18} />}
            label="Products"
            active={isActive('/products')}
            onClick={() => navigate('/products')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<Wrench size={18} />}
            label="Services"
            active={isActive('/services')}
            onClick={() => navigate('/services')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<FileText size={18} />}
            label="Documents"
            active={isActive('/documents')}
            onClick={() => navigate('/documents')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<AlertTriangle size={18} />}
            label="Complaints"
            active={isActive('/complaints')}
            onClick={() => navigate('/complaints')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<Bell size={18} />}
            label="Warnings"
            active={isActive('/warnings')}
            onClick={() => navigate('/warnings')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<CheckSquare size={18} />}
            label="Tasks"
            active={isActive('/tasks')}
            onClick={() => navigate('/tasks')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<ClipboardCheck size={18} />}
            label="Audits"
            active={isActive('/audits')}
            onClick={() => navigate('/audits')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<Users size={18} />}
            label="Suppliers"
            active={isActive('/suppliers')}
            onClick={() => navigate('/suppliers')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<UserCheck size={18} />}
            label="Customers"
            active={isActive('/customers')}
            onClick={() => navigate('/customers')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<Utensils size={18} />}
            label="Recipes"
            active={isActive('/recipes')}
            onClick={() => navigate('/recipes')}
            collapsed={collapsed}
          />
        </NavItem>

        {/* Warehouse Section */}
        <NavItem
          icon={<Warehouse size={20} />}
          label="Warehouse"
          collapsed={collapsed}
        >
          <NavItem
            icon={<Boxes size={18} />}
            label="Stock Management"
            active={isActive('/warehouse/stock')}
            onClick={() => navigate('/warehouse/stock')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<PackageSearch size={18} />}
            label="Inventory Control"
            active={isActive('/warehouse/inventory')}
            onClick={() => navigate('/warehouse/inventory')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<MapPin size={18} />}
            label="Locations"
            active={isActive('/warehouse/locations')}
            onClick={() => navigate('/warehouse/locations')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<Grid size={18} />}
            label="Shelves"
            active={isActive('/warehouse/locations/shelves')}
            onClick={() => navigate('/warehouse/locations/shelves')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<Link2 size={18} />}
            label="Integrations"
            active={isActive('/warehouse/integrations')}
            onClick={() => navigate('/warehouse/integrations')}
            collapsed={collapsed}
          />
        </NavItem>

        {/* Digital Assets */}
        <NavItem
          icon={<Image size={20} />}
          label="Digital Assets"
          collapsed={collapsed}
        >
          <NavItem
            icon={<Image size={18} />}
            label="Photos"
            collapsed={collapsed}
          >
            <NavItem
              icon={<Box size={16} />}
              label="Product Photos"
              active={isActive('/assets/photos/products')}
              onClick={() => navigate('/assets/photos/products')}
              collapsed={collapsed}
            />
            <NavItem
              icon={<Package size={16} />}
              label="Box Photos"
              active={isActive('/assets/photos/boxes')}
              onClick={() => navigate('/assets/photos/boxes')}
              collapsed={collapsed}
            />
            <NavItem
              icon={<Boxes size={16} />}
              label="Pallet Photos"
              active={isActive('/assets/photos/pallets')}
              onClick={() => navigate('/assets/photos/pallets')}
              collapsed={collapsed}
            />
          </NavItem>

          <NavItem
            icon={<Video size={18} />}
            label="Videos"
            active={isActive('/assets/videos')}
            onClick={() => navigate('/assets/videos')}
            collapsed={collapsed}
          />

          <NavItem
            icon={<Sticker size={18} />}
            label="Labels"
            collapsed={collapsed}
          >
            <NavItem
              icon={<QrCode size={16} />}
              label="Product Labels"
              active={isActive('/assets/labels/products')}
              onClick={() => navigate('/assets/labels/products')}
              collapsed={collapsed}
            />
            <NavItem
              icon={<Box size={16} />}
              label="Box Labels"
              active={isActive('/assets/labels/boxes')}
              onClick={() => navigate('/assets/labels/boxes')}
              collapsed={collapsed}
            />
            <NavItem
              icon={<Package size={16} />}
              label="Pallet Labels"
              active={isActive('/assets/labels/pallets')}
              onClick={() => navigate('/assets/labels/pallets')}
              collapsed={collapsed}
            />
          </NavItem>
        </NavItem>

        {/* Academy */}
        <NavItem
          icon={<GraduationCap size={20} />}
          label="Academy"
          collapsed={collapsed}
        >
          <NavItem
            icon={<BookOpen size={18} />}
            label="Courses"
            active={isActive('/academy/courses')}
            onClick={() => navigate('/academy/courses')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<Award size={18} />}
            label="Certifications"
            active={isActive('/academy/certifications')}
            onClick={() => navigate('/academy/certifications')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<UserPlus size={18} />}
            label="Enrollments"
            active={isActive('/academy/enrollments')}
            onClick={() => navigate('/academy/enrollments')}
            collapsed={collapsed}
          />
        </NavItem>

        {/* E-Commerce */}
        <NavItem
          icon={<ShoppingBag size={20} />}
          label="E-Commerce"
          collapsed={collapsed}
        >
          <NavItem
            icon={<ShoppingBag size={18} />}
            label="Shopify"
            active={isActive('/ecommerce/shopify')}
            onClick={() => navigate('/ecommerce/shopify')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<Store size={18} />}
            label="WooCommerce"
            active={isActive('/ecommerce/woocommerce')}
            onClick={() => navigate('/ecommerce/woocommerce')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<ShoppingBasket size={18} />}
            label="Amazon"
            active={isActive('/ecommerce/amazon')}
            onClick={() => navigate('/ecommerce/amazon')}
            collapsed={collapsed}
          />
        </NavItem>

        {/* Accountancy */}
        <NavItem
          icon={<Calculator size={20} />}
          label="Accountancy"
          collapsed={collapsed}
        >
          <NavItem
            icon={<Calculator size={18} />}
            label="QuickBooks"
            active={isActive('/accountancy/quickbooks')}
            onClick={() => navigate('/accountancy/quickbooks')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<DollarSign size={18} />}
            label="NetSuite"
            active={isActive('/accountancy/netsuite')}
            onClick={() => navigate('/accountancy/netsuite')}
            collapsed={collapsed}
          />
          <NavItem
            icon={<BookOpenCheck size={18} />}
            label="TSmartBooks"
            active={isActive('/accountancy/tsmartbooks')}
            onClick={() => navigate('/accountancy/tsmartbooks')}
            collapsed={collapsed}
          />
        </NavItem>

        {/* Settings */}
        <NavItem
          icon={<Settings size={20} />}
          label="Settings"
          active={isActive('/settings')}
          onClick={() => navigate('/settings')}
          collapsed={collapsed}
        />
      </div>

      {/* Theme Toggle */}
      <div className="p-4 border-t border-[var(--divider)]">
        <button
          className={`flex items-center p-2 rounded-md hover:bg-[var(--primary-main)] hover:bg-opacity-10 text-[var(--text-secondary)] hover:text-[var(--primary-main)] transition-colors duration-200 ${collapsed ? 'justify-center w-full' : 'w-full'}`}
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
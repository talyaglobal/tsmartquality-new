import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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
  LayoutDashboard
} from 'lucide-react'
import { NavItem } from '../ui/NavItem'

interface SidebarProps {
  darkMode: boolean
  toggleDarkMode: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ darkMode, toggleDarkMode }) => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <div
      className={`bg-[var(--background-paper)] h-screen transition-all duration-300 border-r border-[var(--divider)] flex flex-col
        ${collapsed ? 'w-20' : 'w-64'}`}
    >
      <div className="flex items-center justify-between p-4 border-b border-[var(--divider)]">
        {!collapsed && (
          <div className="flex items-center">
            <Box className="text-[#7367F0] w-8 h-8" />
            <h2 className="text-[#7367F0] font-bold ml-2">TSmart Quality</h2>
          </div>
        )}
        <button
          className="p-2 rounded-md hover:bg-[#7367F0] hover:bg-opacity-10 text-[var(--text-secondary)] hover:text-[#7367F0] transition-colors duration-200"
          onClick={() => setCollapsed(!collapsed)}
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="flex-1 py-4 overflow-y-auto">
        {/* Dashboards Section */}
        <div className="mb-6">
          <div className="px-4 mb-2">
            <span className="text-xs font-medium text-[var(--text-secondary)] uppercase">Dashboards</span>
          </div>
          <NavItem
            icon={<LayoutDashboard size={20} />}
            label="Dashboards"
            defaultExpanded={true}
          >
            <NavItem
              icon={<BarChart2 size={18} />}
              label="Quality Dashboard"
              active={isActive('/dashboard')}
              onClick={() => navigate('/dashboard')}
            />
            <NavItem
              icon={<LineChart size={18} />}
              label="Product Dashboard"
              active={isActive('/products/dashboard')}
              onClick={() => navigate('/products/dashboard')}
            />
          </NavItem>
        </div>

        {/* Main Navigation */}
        <div className="mb-6">
          <div className="px-4 mb-2">
            <span className="text-xs font-medium text-[var(--text-secondary)] uppercase">Main</span>
          </div>

          <NavItem
            icon={<Box size={20} />}
            label="Products"
            active={isActive('/products')}
            onClick={() => navigate('/products')}
          />

          <NavItem
            icon={<Layers size={20} />}
            label="Palletizator"
            active={isActive('/palletizator')}
          >
            <NavItem
              icon={<Package size={20} />}
              label="100x120 Pallet"
              active={isActive('/palletizator/100x120')}
              onClick={() => navigate('/palletizator/100x120')}
            />
            <NavItem
              icon={<Package size={20} />}
              label="80x120 Pallet"
              active={isActive('/palletizator/80x120')}
              onClick={() => navigate('/palletizator/80x120')}
            />
            <NavItem
              icon={<Package size={20} />}
              label="Floor Load"
              active={isActive('/palletizator/floor')}
              onClick={() => navigate('/palletizator/floor')}
            />
          </NavItem>

          <NavItem
            icon={<Utensils size={20} />}
            label="Recipes"
            active={isActive('/recipes')}
            onClick={() => navigate('/recipes')}
          />
          <NavItem
            icon={<FileText size={20} />}
            label="Documents"
            active={isActive('/documents')}
            onClick={() => navigate('/documents')}
          />
          <NavItem
            icon={<AlertTriangle size={20} />}
            label="Complaints"
            active={isActive('/complaints')}
            onClick={() => navigate('/complaints')}
          />
          <NavItem
            icon={<ClipboardCheck size={20} />}
            label="Audits"
            active={isActive('/audits')}
            onClick={() => navigate('/audits')}
          />
          <NavItem
            icon={<Users size={20} />}
            label="Suppliers"
            active={isActive('/suppliers')}
            onClick={() => navigate('/suppliers')}
          />
        </div>

        {/* Academy Section */}
        <div className="mb-6">
          <div className="px-4 mb-2">
            <span className="text-xs font-medium text-[var(--text-secondary)] uppercase">Academy</span>
          </div>

          <NavItem
            icon={<BookOpen size={20} />}
            label="Courses"
            active={isActive('/academy/courses')}
            onClick={() => navigate('/academy/courses')}
          />
          <NavItem
            icon={<Award size={20} />}
            label="Certifications"
            active={isActive('/academy/certifications')}
            onClick={() => navigate('/academy/certifications')}
          />
          <NavItem
            icon={<UserPlus size={20} />}
            label="Enrollments"
            active={isActive('/academy/enrollments')}
            onClick={() => navigate('/academy/enrollments')}
          />
        </div>

        {/* Digital Assets Section */}
        <div className="mb-6">
          <div className="px-4 mb-2">
            <span className="text-xs font-medium text-[var(--text-secondary)] uppercase">Digital Assets</span>
          </div>
          
          <NavItem
            icon={<Image size={20} />}
            label="Photos"
            active={isActive('/assets/photos')}
            onClick={() => navigate('/assets/photos')}
          >
            <NavItem
              icon={<Image size={20} />}
              label="Product Photos"
              active={isActive('/assets/photos/products')}
              onClick={() => navigate('/assets/photos/products')}
            />
            <NavItem
              icon={<Box size={20} />}
              label="Box Photos"
              active={isActive('/assets/photos/boxes')}
              onClick={() => navigate('/assets/photos/boxes')}
            />
            <NavItem
              icon={<Package size={20} />}
              label="Pallet Photos"
              active={isActive('/assets/photos/pallets')}
              onClick={() => navigate('/assets/photos/pallets')}
            />
          </NavItem>

          <NavItem
            icon={<Video size={20} />}
            label="Videos"
            active={isActive('/assets/videos')}
            onClick={() => navigate('/assets/videos')}
          />

          <NavItem
            icon={<Sticker size={20} />}
            label="Labels"
            active={isActive('/assets/labels')}
            onClick={() => navigate('/assets/labels')}
          >
            <NavItem
              icon={<QrCode size={20} />}
              label="Product Labels"
              active={isActive('/assets/labels/products')}
              onClick={() => navigate('/assets/labels/products')}
            />
            <NavItem
              icon={<Box size={20} />}
              label="Box Labels"
              active={isActive('/assets/labels/boxes')}
              onClick={() => navigate('/assets/labels/boxes')}
            />
            <NavItem
              icon={<Package size={20} />}
              label="Pallet Labels"
              active={isActive('/assets/labels/pallets')}
              onClick={() => navigate('/assets/labels/pallets')}
            />
          </NavItem>
        </div>

        {/* Logistics Section */}
        <div className="mb-6">
          <div className="px-4 mb-2">
            <span className="text-xs font-medium text-[var(--text-secondary)] uppercase">Logistics</span>
          </div>
          
          <NavItem
            icon={<Warehouse size={20} />}
            label="Warehouse"
            active={isActive('/warehouse')}
            onClick={() => navigate('/warehouse')}
          >
            <NavItem
              icon={<Boxes size={20} />}
              label="Stock Management"
              active={isActive('/warehouse/stock')}
              onClick={() => navigate('/warehouse/stock')}
            />
            <NavItem
              icon={<PackageSearch size={20} />}
              label="Inventory Control"
              active={isActive('/warehouse/inventory')}
              onClick={() => navigate('/warehouse/inventory')}
            />
            <NavItem
              icon={<MapPin size={20} />}
              label="Locations"
              active={isActive('/warehouse/locations')}
              onClick={() => navigate('/warehouse/locations')}
            >
              <NavItem
                icon={<Grid size={20} />}
                label="Shelves"
                active={isActive('/warehouse/locations/shelves')}
                onClick={() => navigate('/warehouse/locations/shelves')}
              />
            </NavItem>
            <NavItem
              icon={<Link2 size={20} />}
              label="Integrations"
              active={isActive('/warehouse/integrations')}
              onClick={() => navigate('/warehouse/integrations')}
            />
          </NavItem>
        </div>

        {/* E-Commerce Section */}
        <div className="mb-6">
          <div className="px-4 mb-2">
            <span className="text-xs font-medium text-[var(--text-secondary)] uppercase">E-Commerce</span>
          </div>

          <NavItem
            icon={<ShoppingBag size={20} />}
            label="Shopify"
            active={isActive('/ecommerce/shopify')}
            onClick={() => navigate('/ecommerce/shopify')}
          />
          <NavItem
            icon={<Store size={20} />}
            label="WooCommerce"
            active={isActive('/ecommerce/woocommerce')}
            onClick={() => navigate('/ecommerce/woocommerce')}
          />
          <NavItem
            icon={<ShoppingBasket size={20} />}
            label="Amazon"
            active={isActive('/ecommerce/amazon')}
            onClick={() => navigate('/ecommerce/amazon')}
          />
        </div>

        {/* Accountancy Section */}
        <div className="mb-6">
          <div className="px-4 mb-2">
            <span className="text-xs font-medium text-[var(--text-secondary)] uppercase">Accountancy</span>
          </div>

          <NavItem
            icon={<Calculator size={20} />}
            label="QuickBooks"
            active={isActive('/accountancy/quickbooks')}
            onClick={() => navigate('/accountancy/quickbooks')}
          />
          <NavItem
            icon={<DollarSign size={20} />}
            label="NetSuite"
            active={isActive('/accountancy/netsuite')}
            onClick={() => navigate('/accountancy/netsuite')}
          />
          <NavItem
            icon={<BookOpenCheck size={20} />}
            label="TSmartBooks"
            active={isActive('/accountancy/tsmartbooks')}
            onClick={() => navigate('/accountancy/tsmartbooks')}
          />
        </div>

        <NavItem
          icon={<Settings size={20} />}
          label="Settings"
          active={isActive('/settings')}
          onClick={() => navigate('/settings')}
        />
      </div>

      <div className="p-4 border-t border-[var(--divider)]">
        <button
          className="flex items-center w-full p-2 rounded-md hover:bg-[#7367F0] hover:bg-opacity-10 text-[var(--text-secondary)] hover:text-[#7367F0] transition-colors duration-200"
          onClick={toggleDarkMode}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          {!collapsed && <span className="ml-2">Theme</span>}
        </button>
      </div>
    </div>
  )
}

export default Sidebar
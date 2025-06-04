import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  FileText, 
  Settings, 
  Boxes,
  GraduationCap,
  MessageSquare,
  Image,
  Warehouse,
  ShoppingCart,
  Wrench
} from 'lucide-react';
import { NavItem } from '../ui/NavItem';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Services', href: '/services', icon: Wrench },
  { name: 'Suppliers', href: '/suppliers', icon: Users },
  { name: 'Documents', href: '/documents', icon: FileText },
  { name: 'Warehouse', href: '/warehouse', icon: Warehouse },
  { name: 'Audits', href: '/audits', icon: Boxes },
  { name: 'Academy', href: '/academy', icon: GraduationCap },
  { name: 'Complaints', href: '/complaints', icon: MessageSquare },
  { name: 'Assets', href: '/assets/photos', icon: Image },
  { name: 'E-commerce', href: '/ecommerce/amazon', icon: ShoppingCart },
  { name: 'Settings', href: '/settings', icon: Settings },
];

const Sidebar = () => {
  return (
    <div className="flex h-full w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <div className="flex flex-shrink-0 items-center px-4">
          <img
            className="h-8 w-auto"
            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
            alt="Your Company"
          />
        </div>
        <nav className="mt-5 flex-1 space-y-1 bg-white px-2">
          {navigation.map((item) => (
            <NavItem
              key={item.name}
              name={item.name}
              href={item.href}
              icon={item.icon}
            />
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
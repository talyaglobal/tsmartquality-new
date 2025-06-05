import React, { useState } from 'react'
import { Search, Bell, User, Menu, Plus } from 'lucide-react'
import Input from '../ui/Input'
import UserProfile from '../profile/UserProfile'

interface HeaderProps {
  toggleSidebar: () => void
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Sample companies - replace with actual data from your API
  const companies = [
    { id: '1', name: 'Main Company' },
    { id: '2', name: 'Subsidiary A' },
    { id: '3', name: 'Subsidiary B' },
    { id: '4', name: 'Branch Office C' }
  ]

  // Sample user data - replace with actual user data
  const user = {
    name: 'John Doe',
    role: 'Quality Manager',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg'
  };

  // Sample notifications - replace with actual notifications
  const notifications = [
    {
      id: '1',
      title: 'New Complaint',
      message: 'A new complaint has been submitted',
      time: '5 min ago',
      read: false,
      type: 'critical'
    },
    {
      id: '2',
      title: 'Audit Scheduled',
      message: 'New audit scheduled for next week',
      time: '1 hour ago',
      read: false,
      type: 'warning'
    },
    {
      id: '3',
      title: 'Document Updated',
      message: 'Quality manual has been updated',
      time: '3 hours ago',
      read: true,
      type: 'info'
    }
  ];

  return (
    <>
      <header className="bg-[var(--background-paper)] border-b border-[var(--divider)] py-3 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              className="md:hidden text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              onClick={toggleSidebar}
            >
              <Menu size={20} />
            </button>
            
            <div className="w-[250px]">
              <select
                className="w-full border border-[var(--divider)] rounded-md p-2 bg-[var(--background-paper)]"
                defaultValue="1"
              >
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="w-[300px]">
              <Input
                placeholder="Search everything..."
                startIcon={<Search size={18} />}
                className="py-1.5"
              />
            </div>

            <button 
              className="relative p-2 rounded-full hover:bg-[var(--primary-main)] hover:bg-opacity-10"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell size={20} className="text-[var(--text-secondary)]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--error-main)] rounded-full"></span>
            </button>
            
            <button 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => setShowProfile(true)}
            >
              {user.avatar ? (
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-[var(--primary-main)] flex items-center justify-center text-white">
                  <User size={16} />
                </div>
              )}
              <div className="hidden md:block">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-[var(--text-secondary)]">{user.role}</p>
              </div>
            </button>
          </div>
        </div>
      </header>

      {showNotifications && (
        <div className="absolute right-4 top-16 w-80 bg-[var(--background-paper)] rounded-lg shadow-lg z-50 border border-[var(--divider)]">
          <div className="p-4 border-b border-[var(--divider)]">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Notifications</h3>
              <button className="text-sm text-[var(--primary-main)]">Mark all as read</button>
            </div>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`p-4 border-b border-[var(--divider)] hover:bg-[var(--background-default)] cursor-pointer ${
                  !notification.read ? 'bg-[var(--primary-light)] bg-opacity-5' : ''
                }`}
              >
                <div className="flex items-start">
                  <div className={`w-2 h-2 mt-2 rounded-full mr-3 ${
                    notification.type === 'critical' ? 'bg-[var(--error-main)]' :
                    notification.type === 'warning' ? 'bg-[var(--warning-main)]' :
                    'bg-[var(--info-main)]'
                  }`} />
                  <div>
                    <h4 className="font-medium text-sm">{notification.title}</h4>
                    <p className="text-sm text-[var(--text-secondary)]">{notification.message}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">{notification.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 text-center border-t border-[var(--divider)]">
            <button className="text-sm text-[var(--primary-main)]">View all notifications</button>
          </div>
        </div>
      )}

      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
    </>
  )
}

export default Header
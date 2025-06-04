import React, { useState } from 'react'
import { Search, Bell, User, Menu } from 'lucide-react'
import Input from '../ui/Input'
import UserProfile from '../profile/UserProfile'

interface HeaderProps {
  toggleSidebar: () => void
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const [showProfile, setShowProfile] = useState(false);

  // Sample companies - replace with actual data from your API
  const companies = [
    { id: '1', name: 'Main Company' },
    { id: '2', name: 'Subsidiary A' },
    { id: '3', name: 'Subsidiary B' },
    { id: '4', name: 'Branch Office C' }
  ]

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
                className="w-full border border-[var(--divider)] rounded-md p-2 bg-white"
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

            <button className="relative p-2 rounded-full hover:bg-[var(--primary-main)] hover:bg-opacity-10">
              <Bell size={20} className="text-[var(--text-secondary)]" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--error-main)] rounded-full"></span>
            </button>
            
            <button 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => setShowProfile(true)}
            >
              <div className="w-8 h-8 rounded-full bg-[var(--primary-main)] flex items-center justify-center text-white">
                <User size={16} />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-[var(--text-secondary)]">Quality Manager</p>
              </div>
            </button>
          </div>
        </div>
      </header>

      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
    </>
  )
}

export default Header
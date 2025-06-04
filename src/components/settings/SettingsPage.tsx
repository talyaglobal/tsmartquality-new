import React, { useState } from 'react'
import { Plus, Tag, Grid2X2, Settings as SettingsIcon, Users, Link2 } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import TagManagement from './TagManagement'
import CategoryManagement from './CategoryManagement'
import SupplierCategoryManagement from './SupplierCategoryManagement'
import ImportSettings from './ImportSettings'

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tags')

  const tabs = [
    { id: 'tags', label: 'Tags', icon: <Tag size={20} /> },
    { id: 'categories', label: 'Categories', icon: <Grid2X2 size={20} /> },
    { id: 'supplier-categories', label: 'Supplier Categories', icon: <Users size={20} /> },
    { id: 'import', label: 'Import Settings', icon: <Link2 size={20} /> },
    { id: 'general', label: 'General', icon: <SettingsIcon size={20} /> }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Settings</h1>
        <p className="text-[var(--text-secondary)]">
          Configure your application preferences and system settings
        </p>
      </div>

      <div className="flex space-x-4 border-b border-[var(--divider)]">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors
              ${activeTab === tab.id
                ? 'border-[var(--primary-main)] text-[var(--primary-main)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)]'
              }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {activeTab === 'tags' && <TagManagement />}
        {activeTab === 'categories' && <CategoryManagement />}
        {activeTab === 'supplier-categories' && <SupplierCategoryManagement />}
        {activeTab === 'import' && <ImportSettings />}
        {activeTab === 'general' && (
          <Card>
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold mb-2">General Settings Coming Soon</h2>
              <p className="text-[var(--text-secondary)]">
                Additional settings and configurations will be available here soon.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}

export default SettingsPage
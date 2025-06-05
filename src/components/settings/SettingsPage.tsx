import React, { useState } from 'react'
import { Tag, Grid2X2, Settings as SettingsIcon, Users, Link2, Globe } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'
import TagManagement from './TagManagement'
import CategoryManagement from './CategoryManagement'
import SupplierCategoryManagement from './SupplierCategoryManagement'
import ImportSettings from './ImportSettings'
import GeneralSettings from './GeneralSettings'
import IntegrationsSettings from './IntegrationsSettings'

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general')

  const tabs = [
    { id: 'general', label: 'General', icon: <SettingsIcon size={20} /> },
    { id: 'integrations', label: 'Integrations', icon: <Link2 size={20} /> },
    { id: 'tags', label: 'Tags', icon: <Tag size={20} /> },
    { id: 'categories', label: 'Categories', icon: <Grid2X2 size={20} /> },
    { id: 'supplier-categories', label: 'Supplier Categories', icon: <Users size={20} /> },
    { id: 'import', label: 'Import Settings', icon: <Globe size={20} /> }
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
        {activeTab === 'general' && <GeneralSettings />}
        {activeTab === 'integrations' && <IntegrationsSettings />}
        {activeTab === 'tags' && <TagManagement />}
        {activeTab === 'categories' && <CategoryManagement />}
        {activeTab === 'supplier-categories' && <SupplierCategoryManagement />}
        {activeTab === 'import' && <ImportSettings />}
      </div>
    </div>
  )
}

export default SettingsPage
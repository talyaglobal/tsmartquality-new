import React, { useState } from 'react'
import { Link2, Check, X, RefreshCw, Settings, Database, Truck, Box } from 'lucide-react'
import Card from '../../ui/Card'
import Button from '../../ui/Button'
import Input from '../../ui/Input'

interface Integration {
  id: string
  name: string
  type: 'erp' | 'wms' | 'tms' | 'inventory'
  status: 'active' | 'inactive' | 'error'
  lastSync: string
  description: string
  connectedOn: string
}

const IntegrationsPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false)

  // Sample data - replace with actual data from your API
  const integrations: Integration[] = [
    {
      id: '1',
      name: 'SAP ERP',
      type: 'erp',
      status: 'active',
      lastSync: '2024-03-15 14:30',
      description: 'Enterprise resource planning integration',
      connectedOn: '2024-01-01'
    },
    {
      id: '2',
      name: 'Manhattan WMS',
      type: 'wms',
      status: 'active',
      lastSync: '2024-03-15 14:25',
      description: 'Warehouse management system integration',
      connectedOn: '2024-01-15'
    },
    {
      id: '3',
      name: 'Descartes TMS',
      type: 'tms',
      status: 'error',
      lastSync: '2024-03-15 10:15',
      description: 'Transportation management system integration',
      connectedOn: '2024-02-01'
    }
  ]

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'erp':
        return <Database size={24} />
      case 'wms':
        return <Box size={24} />
      case 'tms':
        return <Truck size={24} />
      default:
        return <Link2 size={24} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-[var(--success-light)] text-[var(--success-dark)]'
      case 'inactive':
        return 'bg-[var(--warning-light)] text-[var(--warning-dark)]'
      case 'error':
        return 'bg-[var(--error-light)] text-[var(--error-dark)]'
      default:
        return 'bg-[var(--info-light)] text-[var(--info-dark)]'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Warehouse Integrations</h1>
          <p className="text-[var(--text-secondary)]">
            Manage connections with external systems and services
          </p>
        </div>
        <Button 
          icon={<Link2 size={20} />}
          onClick={() => setShowForm(true)}
        >
          Add Integration
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map(integration => (
          <Card key={integration.id}>
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-[var(--primary-main)] bg-opacity-10 text-[var(--primary-main)] mr-3">
                  {getIntegrationIcon(integration.type)}
                </div>
                <div>
                  <h3 className="font-medium">{integration.name}</h3>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {integration.description}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(integration.status)}`}>
                {integration.status.charAt(0).toUpperCase() + integration.status.slice(1)}
              </span>
            </div>

            <div className="mt-4 pt-4 border-t border-[var(--divider)]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Last Sync</p>
                  <p className="text-sm font-medium">{integration.lastSync}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Connected On</p>
                  <p className="text-sm font-medium">{integration.connectedOn}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                icon={<RefreshCw size={16} />}
              >
                Sync Now
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<Settings size={16} />}
              >
                Configure
              </Button>
              {integration.status === 'active' ? (
                <Button
                  variant="danger"
                  size="sm"
                  icon={<X size={16} />}
                >
                  Disconnect
                </Button>
              ) : (
                <Button
                  variant="success"
                  size="sm"
                  icon={<Check size={16} />}
                >
                  Connect
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[600px]">
            <h2 className="text-xl font-semibold mb-4">Add New Integration</h2>
            <form className="space-y-4">
              <Input
                label="Integration Name"
                placeholder="Enter integration name"
                required
              />
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Integration Type
                </label>
                <select className="w-full border border-[var(--divider)] rounded-md p-2">
                  <option value="">Select Type</option>
                  <option value="erp">ERP System</option>
                  <option value="wms">Warehouse Management System</option>
                  <option value="tms">Transportation Management System</option>
                  <option value="inventory">Inventory Management System</option>
                </select>
              </div>
              <Input
                label="Description"
                placeholder="Enter description"
                multiline
                rows={3}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button>
                  Add Integration
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default IntegrationsPage
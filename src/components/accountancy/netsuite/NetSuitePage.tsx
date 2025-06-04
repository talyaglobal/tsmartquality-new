```typescript
import React, { useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, RefreshCw, Settings, Link2, CheckCircle, XCircle, AlertCircle, DollarSign, FileText, Box, Truck } from 'lucide-react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';

interface SyncStatus {
  id: string;
  type: string;
  lastSync: string;
  status: 'success' | 'error' | 'pending';
  recordsProcessed: number;
  message?: string;
}

interface DataMapping {
  id: string;
  name: string;
  direction: 'push' | 'pull' | 'bidirectional';
  status: 'active' | 'inactive';
  frequency: string;
  lastSync: string;
  nextSync: string;
  module: string;
}

const NetSuitePage: React.FC = () => {
  const [connected, setConnected] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Sample data - replace with actual data from your API
  const dataMappings: DataMapping[] = [
    {
      id: '1',
      name: 'Items & Inventory',
      direction: 'bidirectional',
      status: 'active',
      frequency: 'Every 30 minutes',
      lastSync: '2024-03-15 14:30',
      nextSync: '2024-03-15 15:00',
      module: 'inventory'
    },
    {
      id: '2',
      name: 'Purchase Orders',
      direction: 'push',
      status: 'active',
      frequency: 'Every 15 minutes',
      lastSync: '2024-03-15 14:45',
      nextSync: '2024-03-15 15:00',
      module: 'purchasing'
    },
    {
      id: '3',
      name: 'Sales Orders',
      direction: 'push',
      status: 'active',
      frequency: 'Every 15 minutes',
      lastSync: '2024-03-15 14:45',
      nextSync: '2024-03-15 15:00',
      module: 'sales'
    },
    {
      id: '4',
      name: 'Financial Transactions',
      direction: 'push',
      status: 'active',
      frequency: 'Every hour',
      lastSync: '2024-03-15 14:00',
      nextSync: '2024-03-15 15:00',
      module: 'finance'
    },
    {
      id: '5',
      name: 'Vendors & Suppliers',
      direction: 'bidirectional',
      status: 'active',
      frequency: 'Every 6 hours',
      lastSync: '2024-03-15 12:00',
      nextSync: '2024-03-15 18:00',
      module: 'vendors'
    },
    {
      id: '6',
      name: 'Quality Records',
      direction: 'push',
      status: 'active',
      frequency: 'Every hour',
      lastSync: '2024-03-15 14:00',
      nextSync: '2024-03-15 15:00',
      module: 'quality'
    }
  ];

  const recentSyncs: SyncStatus[] = [
    {
      id: '1',
      type: 'Items & Inventory',
      lastSync: '2024-03-15 14:30',
      status: 'success',
      recordsProcessed: 156
    },
    {
      id: '2',
      type: 'Purchase Orders',
      lastSync: '2024-03-15 14:25',
      status: 'error',
      recordsProcessed: 23,
      message: 'Failed to sync 2 POs due to missing vendor information'
    },
    {
      id: '3',
      type: 'Financial Transactions',
      lastSync: '2024-03-15 14:20',
      status: 'success',
      recordsProcessed: 89
    }
  ];

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'inventory':
        return <Box size={16} />;
      case 'purchasing':
        return <Truck size={16} />;
      case 'sales':
        return <DollarSign size={16} />;
      case 'finance':
        return <FileText size={16} />;
      default:
        return <Settings size={16} />;
    }
  };

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case 'push':
        return <ArrowUpFromLine size={16} />;
      case 'pull':
        return <ArrowDownToLine size={16} />;
      default:
        return <RefreshCw size={16} />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-[var(--success-main)]" />;
      case 'error':
        return <XCircle className="text-[var(--error-main)]" />;
      default:
        return <AlertCircle className="text-[var(--warning-main)]" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">NetSuite Integration</h1>
          <p className="text-[var(--text-secondary)]">
            Manage data synchronization with NetSuite ERP
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            icon={<Settings size={20} />}
          >
            Settings
          </Button>
          {connected ? (
            <Button
              variant="danger"
              icon={<Link2 size={20} />}
              onClick={() => setConnected(false)}
            >
              Disconnect
            </Button>
          ) : (
            <Button
              icon={<Link2 size={20} />}
              onClick={() => setConnected(true)}
            >
              Connect
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Data Mappings</h2>
              <Button
                variant="outline"
                icon={<RefreshCw size={20} />}
                loading={syncing}
                onClick={() => {
                  setSyncing(true);
                  setTimeout(() => setSyncing(false), 2000);
                }}
              >
                Sync Now
              </Button>
            </div>

            <div className="space-y-4">
              {dataMappings.map((mapping) => (
                <div
                  key={mapping.id}
                  className="p-4 border border-[var(--divider)] rounded-lg hover:border-[var(--primary-main)] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={\`p-2 rounded-lg ${
                        mapping.direction === 'push' ? 'bg-[var(--success-light)] text-[var(--success-dark)]' :
                        mapping.direction === 'pull' ? 'bg-[var(--info-light)] text-[var(--info-dark)]' :
                        'bg-[var(--warning-light)] text-[var(--warning-dark)]'
                      }`}>
                        {getModuleIcon(mapping.module)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{mapping.name}</h3>
                          <div className={\`p-1 rounded ${
                            mapping.direction === 'push' ? 'bg-[var(--success-light)] text-[var(--success-dark)]' :
                            mapping.direction === 'pull' ? 'bg-[var(--info-light)] text-[var(--info-dark)]' :
                            'bg-[var(--warning-light)] text-[var(--warning-dark)]'
                          }`}>
                            {getDirectionIcon(mapping.direction)}
                          </div>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {mapping.direction === 'push' ? 'Push to NetSuite' :
                           mapping.direction === 'pull' ? 'Pull from NetSuite' :
                           'Two-way Sync'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        Syncs {mapping.frequency}
                      </p>
                      <p className="text-sm text-[var(--text-secondary)]">
                        Next sync at {mapping.nextSync}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<Settings size={16} />}
                    >
                      Configure
                    </Button>
                    <Button
                      variant={mapping.status === 'active' ? 'danger' : 'success'}
                      size="sm"
                    >
                      {mapping.status === 'active' ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card>
            <h2 className="text-lg font-semibold mb-6">Recent Syncs</h2>
            <div className="space-y-4">
              {recentSyncs.map((sync) => (
                <div
                  key={sync.id}
                  className="p-4 border border-[var(--divider)] rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{sync.type}</h4>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {sync.recordsProcessed} records processed
                      </p>
                      {sync.message && (
                        <p className="text-sm text-[var(--error-main)] mt-1">
                          {sync.message}
                        </p>
                      )}
                    </div>
                    {getStatusIcon(sync.status)}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-2">
                    {sync.lastSync}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NetSuitePage;
```
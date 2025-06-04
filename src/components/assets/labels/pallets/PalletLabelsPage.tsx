import React, { useState } from 'react';
import { Plus, Search, QrCode, Download, Trash2, Edit } from 'lucide-react';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';

interface Label {
  id: string;
  title: string;
  palletCode: string;
  type: string;
  format: string;
  language: string;
  version: string;
  createdAt: string;
  status: 'active' | 'draft' | 'archived';
  dimensions: string;
  loadCapacity: string;
}

const PalletLabelsPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);

  // Sample data - replace with actual data from your API
  const labels: Label[] = [
    {
      id: '1',
      title: 'Euro Pallet Label',
      palletCode: 'PLT001',
      type: 'Pallet Label',
      format: 'PDF',
      language: 'English',
      version: '2.1',
      createdAt: '2024-03-15',
      status: 'active',
      dimensions: '1200x800mm',
      loadCapacity: '1500 kg'
    },
    {
      id: '2',
      title: 'Block Pallet Label',
      palletCode: 'PLT002',
      type: 'Pallet Label',
      format: 'PDF',
      language: 'English',
      version: '1.3',
      createdAt: '2024-03-14',
      status: 'draft',
      dimensions: '1000x1200mm',
      loadCapacity: '2000 kg'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-[var(--success-light)] text-[var(--success-dark)]';
      case 'draft':
        return 'bg-[var(--warning-light)] text-[var(--warning-dark)]';
      case 'archived':
        return 'bg-[var(--error-light)] text-[var(--error-dark)]';
      default:
        return 'bg-[var(--info-light)] text-[var(--info-dark)]';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Pallet Labels</h1>
          <p className="text-[var(--text-secondary)]">
            Manage and generate pallet labels and barcodes
          </p>
        </div>
        <Button 
          icon={<Plus size={20} />}
          onClick={() => setShowForm(true)}
        >
          Create Label
        </Button>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="w-96">
            <Input
              placeholder="Search labels..."
              startIcon={<Search size={20} />}
            />
          </div>
          <div className="flex space-x-2">
            <select className="border border-[var(--divider)] rounded-md px-3 py-2">
              <option value="">All Types</option>
              <option value="euro">Euro Pallet</option>
              <option value="block">Block Pallet</option>
              <option value="custom">Custom Pallet</option>
            </select>
            <select className="border border-[var(--divider)] rounded-md px-3 py-2">
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {labels.map((label) => (
            <div
              key={label.id}
              className="bg-[var(--background-paper)] rounded-lg shadow overflow-hidden"
            >
              <div className="p-4 border-b border-[var(--divider)]">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{label.title}</h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      Pallet Code: {label.palletCode}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(label.status)}`}>
                    {label.status.charAt(0).toUpperCase() + label.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                  <div>
                    <span className="text-[var(--text-secondary)]">Type: </span>
                    <span className="font-medium">{label.type}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)]">Format: </span>
                    <span className="font-medium">{label.format}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)]">Language: </span>
                    <span className="font-medium">{label.language}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)]">Version: </span>
                    <span className="font-medium">{label.version}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)]">Dimensions: </span>
                    <span className="font-medium">{label.dimensions}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)]">Load Capacity: </span>
                    <span className="font-medium">{label.loadCapacity}</span>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<QrCode size={16} />}
                  >
                    Generate QR
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Download size={16} />}
                  >
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Edit size={16} />}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<Trash2 size={16} />}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default PalletLabelsPage;
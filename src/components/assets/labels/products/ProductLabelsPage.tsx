import React, { useState } from 'react';
import { Plus, Search, QrCode, Download, Trash2, Edit } from 'lucide-react';
import Card from '../../../ui/Card';
import Button from '../../../ui/Button';
import Input from '../../../ui/Input';

interface Label {
  id: string;
  title: string;
  productCode: string;
  type: string;
  format: string;
  language: string;
  version: string;
  createdAt: string;
  status: 'active' | 'draft' | 'archived';
}

const ProductLabelsPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);

  // Sample data - replace with actual data from your API
  const labels: Label[] = [
    {
      id: '1',
      title: 'Premium Dark Chocolate Label',
      productCode: 'PRD001',
      type: 'Product Label',
      format: 'PDF',
      language: 'English',
      version: '2.1',
      createdAt: '2024-03-15',
      status: 'active'
    },
    {
      id: '2',
      title: 'Milk Chocolate Label',
      productCode: 'PRD002',
      type: 'Product Label',
      format: 'PDF',
      language: 'English',
      version: '1.3',
      createdAt: '2024-03-14',
      status: 'draft'
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
          <h1 className="text-2xl font-bold mb-1">Product Labels</h1>
          <p className="text-[var(--text-secondary)]">
            Manage and generate product labels and barcodes
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
              <option value="product">Product Label</option>
              <option value="shipping">Shipping Label</option>
              <option value="barcode">Barcode</option>
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
                      Product Code: {label.productCode}
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

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Create New Label</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X size={24} />
              </button>
            </div>

            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Label Title"
                  required
                />
                <Input
                  label="Product Code"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    Label Type
                  </label>
                  <select
                    className="w-full border border-[var(--divider)] rounded-md p-2"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="product">Product Label</option>
                    <option value="shipping">Shipping Label</option>
                    <option value="barcode">Barcode</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                    Format
                  </label>
                  <select
                    className="w-full border border-[var(--divider)] rounded-md p-2"
                    required
                  >
                    <option value="">Select Format</option>
                    <option value="pdf">PDF</option>
                    <option value="png">PNG</option>
                    <option value="svg">SVG</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Language"
                  required
                />
                <Input
                  label="Version"
                  required
                />
              </div>

              <Input
                label="Description"
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
                <Button
                  icon={<Plus size={20} />}
                >
                  Create Label
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductLabelsPage;
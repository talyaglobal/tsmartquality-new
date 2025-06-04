import React from 'react'
import { Edit, Trash2, Eye, FileText } from 'lucide-react'
import Button from '../ui/Button'

interface Supplier {
  id: string
  name: string
  code: string
  category: string
  type: 'preferred' | 'regular' | 'blacklist'
  contactPerson: string
  status: string
  rating: string
  lastAudit: string
  country: string
  state?: string
  city?: string
}

const SupplierGrid: React.FC = () => {
  const suppliers: Supplier[] = [
    {
      id: '1',
      name: 'Quality Components Ltd',
      code: 'SUP001',
      category: 'Raw Materials',
      type: 'preferred',
      contactPerson: 'John Smith',
      status: 'Active',
      rating: 'A',
      lastAudit: '2024-02-15',
      country: 'United States',
      state: 'California',
      city: 'Los Angeles'
    },
    {
      id: '2',
      name: 'Precision Manufacturing Co',
      code: 'SUP002',
      category: 'Equipment',
      type: 'regular',
      contactPerson: 'Sarah Johnson',
      status: 'Under Review',
      rating: 'B',
      lastAudit: '2024-01-20',
      country: 'Germany',
      state: 'Bavaria',
      city: 'Munich'
    },
    {
      id: '3',
      name: 'Unreliable Supplies Inc',
      code: 'SUP003',
      category: 'Packaging',
      type: 'blacklist',
      contactPerson: 'Mike Wilson',
      status: 'Inactive',
      rating: 'F',
      lastAudit: '2023-12-10',
      country: 'France',
      state: 'Île-de-France',
      city: 'Paris'
    }
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'preferred':
        return 'bg-[var(--success-light)] text-[var(--success-dark)]'
      case 'regular':
        return 'bg-[var(--info-light)] text-[var(--info-dark)]'
      case 'blacklist':
        return 'bg-[var(--error-light)] text-[var(--error-dark)]'
      default:
        return 'bg-[var(--primary-light)] text-[var(--primary-dark)]'
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-[var(--divider)]">
        <thead className="bg-[var(--background-paper)]">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Supplier Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Country
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Location
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Contact Person
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Rating
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Last Audit
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-[var(--background-paper)] divide-y divide-[var(--divider)]">
          {suppliers.map((supplier) => (
            <tr key={supplier.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium">{supplier.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm">{supplier.code}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm">{supplier.category}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(supplier.type)}`}>
                  {supplier.type.charAt(0).toUpperCase() + supplier.type.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm">{supplier.country}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm">
                  {supplier.city && supplier.state 
                    ? `${supplier.city}, ${supplier.state}`
                    : supplier.city || supplier.state || '-'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm">{supplier.contactPerson}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${supplier.status === 'Active' ? 'bg-[var(--success-light)] text-[var(--success-dark)]' : 
                    supplier.status === 'Under Review' ? 'bg-[var(--warning-light)] text-[var(--warning-dark)]' :
                    'bg-[var(--error-light)] text-[var(--error-dark)]'}`}>
                  {supplier.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${supplier.rating === 'A' ? 'bg-[var(--success-light)] text-[var(--success-dark)]' : 
                    supplier.rating === 'B' ? 'bg-[var(--info-light)] text-[var(--info-dark)]' :
                    'bg-[var(--warning-light)] text-[var(--warning-dark)]'}`}>
                  {supplier.rating}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {supplier.lastAudit}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" icon={<Eye size={16} />}>
                    View
                  </Button>
                  <Button variant="outline" size="sm" icon={<FileText size={16} />}>
                    Documents
                  </Button>
                  <Button variant="outline" size="sm" icon={<Edit size={16} />}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" icon={<Trash2 size={16} />}>
                    Delete
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default SupplierGrid
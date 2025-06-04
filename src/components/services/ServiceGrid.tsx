import React from 'react'
import { Edit, Trash2, Eye, FileText } from 'lucide-react'
import Button from '../ui/Button'

interface Service {
  id: string
  name: string
  code: string
  category: string
  status: string
  lastUpdated: string
  description: string
}

const ServiceGrid: React.FC = () => {
  const services: Service[] = [
    {
      id: '1',
      name: 'Quality Inspection',
      code: 'SRV001',
      category: 'Quality Control',
      status: 'Active',
      lastUpdated: '2024-03-15',
      description: 'Comprehensive quality inspection service'
    },
    {
      id: '2',
      name: 'Certification Support',
      code: 'SRV002',
      category: 'Compliance',
      status: 'Active',
      lastUpdated: '2024-03-14',
      description: 'Support for quality certifications'
    }
  ]

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-[var(--divider)]">
        <thead className="bg-[var(--background-paper)]">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Service Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Last Updated
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-[var(--background-paper)] divide-y divide-[var(--divider)]">
          {services.map((service) => (
            <tr key={service.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium">{service.name}</div>
                  <div className="text-sm text-[var(--text-secondary)]">{service.description}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm">{service.code}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm">{service.category}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[var(--success-light)] text-[var(--success-dark)]">
                  {service.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {service.lastUpdated}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" icon={<Eye size={16} />}>
                    View
                  </Button>
                  <Button variant="outline" size="sm" icon={<FileText size={16} />}>
                    Specs
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

export default ServiceGrid
import React from 'react'
import { Edit, Trash2, Eye, FileText } from 'lucide-react'
import Button from '../ui/Button'

interface Audit {
  id: string
  title: string
  type: 'internal' | 'external' | 'supplier'
  department: string
  auditor: string
  date: string
  status: string
  standard: string
}

const AuditGrid: React.FC = () => {
  const audits: Audit[] = [
    {
      id: '1',
      title: 'Annual Quality System Review',
      type: 'internal',
      department: 'Quality Control',
      auditor: 'John Smith',
      date: '2024-03-15',
      status: 'Scheduled',
      standard: 'ISO 9001:2015'
    },
    {
      id: '2',
      title: 'ISO 9001 Surveillance',
      type: 'external',
      department: 'Manufacturing',
      auditor: 'Sarah Johnson',
      date: '2024-03-20',
      status: 'In Progress',
      standard: 'ISO 9001:2015'
    },
    {
      id: '3',
      title: 'Raw Materials Supplier Audit',
      type: 'supplier',
      department: 'Procurement',
      auditor: 'Mike Wilson',
      date: '2024-03-25',
      status: 'Scheduled',
      standard: 'Supplier Quality Assessment'
    }
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'internal':
        return 'bg-[var(--info-light)] text-[var(--info-dark)]'
      case 'external':
        return 'bg-[var(--warning-light)] text-[var(--warning-dark)]'
      case 'supplier':
        return 'bg-[var(--success-light)] text-[var(--success-dark)]'
      default:
        return 'bg-[var(--primary-light)] text-[var(--primary-dark)]'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-[var(--warning-light)] text-[var(--warning-dark)]'
      case 'In Progress':
        return 'bg-[var(--info-light)] text-[var(--info-dark)]'
      case 'Completed':
        return 'bg-[var(--success-light)] text-[var(--success-dark)]'
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
              Audit Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Standard
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Department
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Auditor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-[var(--background-paper)] divide-y divide-[var(--divider)]">
          {audits.map((audit) => (
            <tr key={audit.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium">{audit.title}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(audit.type)}`}>
                  {audit.type.charAt(0).toUpperCase() + audit.type.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm">{audit.standard}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm">{audit.department}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm">{audit.auditor}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {audit.date}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(audit.status)}`}>
                  {audit.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" icon={<Eye size={16} />}>
                    View
                  </Button>
                  <Button variant="outline" size="sm" icon={<FileText size={16} />}>
                    Report
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

export default AuditGrid
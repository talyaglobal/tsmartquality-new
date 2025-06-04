import React from 'react'
import { Edit, Trash2, Eye, Mail, Image, ListTodo } from 'lucide-react'
import Button from '../ui/Button'

interface Complaint {
  id: string
  complaintNumber: string
  customerName: string
  productName: string
  status: 'Open' | 'In Progress' | 'Closed'
  priority: string
  dateReceived: string
  assignedTo: string
  email: string
  photos: string[]
  tasks: {
    total: number
    completed: number
  }
}

const ComplaintGrid: React.FC = () => {
  const complaints: Complaint[] = [
    {
      id: '1',
      complaintNumber: 'CMP-001',
      customerName: 'Acme Corp',
      productName: 'Product A',
      status: 'Open',
      priority: 'High',
      dateReceived: '2024-03-10',
      assignedTo: 'John Doe',
      email: 'contact@acmecorp.com',
      photos: [
        'https://images.pexels.com/photos/5025669/pexels-photo-5025669.jpeg',
        'https://images.pexels.com/photos/5025670/pexels-photo-5025670.jpeg'
      ],
      tasks: {
        total: 5,
        completed: 2
      }
    },
    {
      id: '2',
      complaintNumber: 'CMP-002',
      customerName: 'Tech Solutions',
      productName: 'Product B',
      status: 'In Progress',
      priority: 'Medium',
      dateReceived: '2024-03-09',
      assignedTo: 'Jane Smith',
      email: 'support@techsolutions.com',
      photos: [
        'https://images.pexels.com/photos/5025671/pexels-photo-5025671.jpeg'
      ],
      tasks: {
        total: 3,
        completed: 3
      }
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'bg-[var(--error-light)] text-[var(--error-dark)]'
      case 'In Progress':
        return 'bg-[var(--warning-light)] text-[var(--warning-dark)]'
      case 'Closed':
        return 'bg-[var(--success-light)] text-[var(--success-dark)]'
      default:
        return 'bg-[var(--info-light)] text-[var(--info-dark)]'
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-[var(--divider)]">
        <thead className="bg-[var(--background-paper)]">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Complaint Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Product
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Priority
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Tasks
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Photos
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Assigned To
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-[var(--background-paper)] divide-y divide-[var(--divider)]">
          {complaints.map((complaint) => (
            <tr key={complaint.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium">{complaint.complaintNumber}</div>
                <div className="text-sm text-[var(--text-secondary)]">{complaint.dateReceived}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm">{complaint.customerName}</div>
                <a 
                  href={`mailto:${complaint.email}`}
                  className="text-sm text-[var(--primary-main)] hover:underline flex items-center mt-1"
                >
                  <Mail size={14} className="mr-1" />
                  {complaint.email}
                </a>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm">{complaint.productName}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(complaint.status)}`}>
                  {complaint.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                  ${complaint.priority === 'High' ? 'bg-[var(--error-light)] text-[var(--error-dark)]' : 
                    complaint.priority === 'Medium' ? 'bg-[var(--warning-light)] text-[var(--warning-dark)]' :
                    'bg-[var(--info-light)] text-[var(--info-dark)]'}`}>
                  {complaint.priority}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <ListTodo size={16} className="mr-2 text-[var(--text-secondary)]" />
                  <span className="text-sm">
                    {complaint.tasks.completed}/{complaint.tasks.total}
                  </span>
                </div>
                <div className="w-24 bg-[var(--divider)] rounded-full h-1 mt-1">
                  <div 
                    className="bg-[var(--primary-main)] h-1 rounded-full"
                    style={{ width: `${(complaint.tasks.completed / complaint.tasks.total) * 100}%` }}
                  />
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex -space-x-2">
                  {complaint.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Complaint ${complaint.complaintNumber} photo ${index + 1}`}
                      className="w-8 h-8 rounded-full border-2 border-white object-cover"
                    />
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    icon={<Image size={14} />}
                    className="ml-2"
                  >
                    View All
                  </Button>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {complaint.assignedTo}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" icon={<Eye size={16} />}>
                    View
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

export default ComplaintGrid
import React from 'react'
import { Edit, Trash2, Eye, Download } from 'lucide-react'
import Button from '../ui/Button'

interface Document {
  id: string
  name: string
  documentNumber: string
  type: string
  unit: string
  publicationDate: string
  revisionNumber: number
  status: string
}

const DocumentGrid: React.FC = () => {
  const documents: Document[] = [
    {
      id: '1',
      name: 'Quality Manual',
      documentNumber: 'QM-001',
      type: 'Manual',
      unit: 'Quality',
      publicationDate: '2024-03-10',
      revisionNumber: 2,
      status: 'Active',
    },
    // Add more sample documents here
  ]

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-[var(--divider)]">
        <thead className="bg-[var(--background-paper)]">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Document Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Document Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Unit
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Publication Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Rev.
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-[var(--background-paper)] divide-y divide-[var(--divider)]">
          {documents.map((document) => (
            <tr key={document.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium">{document.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm">{document.documentNumber}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm">{document.type}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm">{document.unit}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {document.publicationDate}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {document.revisionNumber}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" icon={<Eye size={16} />}>
                    View
                  </Button>
                  <Button variant="outline" size="sm" icon={<Download size={16} />}>
                    Download
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

export default DocumentGrid
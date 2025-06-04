import React from 'react';
import { Grid, Box } from 'lucide-react';
import Button from '../../ui/Button';

interface Shelf {
  id: string;
  code: string;
  zone: string;
  aisle: string;
  level: number;
  position: string;
  capacity: number;
  utilization: number;
  status: 'available' | 'full' | 'maintenance';
  lastInspection: string;
}

const ShelvesGrid: React.FC = () => {
  // Sample data - replace with actual data from your API
  const shelves: Shelf[] = [
    {
      id: '1',
      code: 'A-01-01-01',
      zone: 'A',
      aisle: '01',
      level: 1,
      position: '01',
      capacity: 1000,
      utilization: 75,
      status: 'available',
      lastInspection: '2024-03-15'
    },
    {
      id: '2',
      code: 'A-01-01-02',
      zone: 'A',
      aisle: '01',
      level: 1,
      position: '02',
      capacity: 1000,
      utilization: 100,
      status: 'full',
      lastInspection: '2024-03-15'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-[var(--success-light)] text-[var(--success-dark)]';
      case 'full':
        return 'bg-[var(--warning-light)] text-[var(--warning-dark)]';
      case 'maintenance':
        return 'bg-[var(--error-light)] text-[var(--error-dark)]';
      default:
        return 'bg-[var(--info-light)] text-[var(--info-dark)]';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-[var(--divider)]">
        <thead className="bg-[var(--background-paper)]">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Shelf Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Location
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Capacity
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Utilization
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Last Inspection
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-[var(--background-paper)] divide-y divide-[var(--divider)]">
          {shelves.map((shelf) => (
            <tr key={shelf.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium">{shelf.code}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm">
                  Zone {shelf.zone}, Aisle {shelf.aisle}, Level {shelf.level}, Pos {shelf.position}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm">{shelf.capacity} units</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="w-full bg-[var(--divider)] rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        shelf.utilization >= 90 ? 'bg-[var(--error-main)]' :
                        shelf.utilization >= 75 ? 'bg-[var(--warning-main)]' :
                        'bg-[var(--success-main)]'
                      }`}
                      style={{ width: `${shelf.utilization}%` }}
                    />
                  </div>
                  <span className="text-sm text-[var(--text-secondary)]">
                    {shelf.utilization}%
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(shelf.status)}`}>
                  {shelf.status.charAt(0).toUpperCase() + shelf.status.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm">{shelf.lastInspection}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Grid size={16} />}
                >
                  View Items
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ShelvesGrid;
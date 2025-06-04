import React from 'react';
import { Edit, Trash2, Eye, Star as StarIcon } from 'lucide-react';
import Button from '../ui/Button';

interface Customer {
  id: string;
  name: string;
  code: string;
  category: 'cash-cow' | 'star' | 'problem-child' | 'dog';
  rating: 1 | 2 | 3 | 4 | 5;
  strategic: boolean;
  contactPerson: string;
  email: string;
  phone: string;
  lastOrder: string;
  status: string;
}

const CustomerGrid: React.FC = () => {
  const customers: Customer[] = [
    {
      id: '1',
      name: 'Acme Corporation',
      code: 'CUS001',
      category: 'cash-cow',
      rating: 5,
      strategic: true,
      contactPerson: 'John Smith',
      email: 'john@acme.com',
      phone: '+1 (555) 123-4567',
      lastOrder: '2024-03-15',
      status: 'Active'
    },
    {
      id: '2',
      name: 'TechCorp Solutions',
      code: 'CUS002',
      category: 'star',
      rating: 4,
      strategic: true,
      contactPerson: 'Sarah Johnson',
      email: 'sarah@techcorp.com',
      phone: '+1 (555) 987-6543',
      lastOrder: '2024-03-14',
      status: 'Active'
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'cash-cow':
        return 'bg-[var(--success-light)] text-[var(--success-dark)]';
      case 'star':
        return 'bg-[var(--warning-light)] text-[var(--warning-dark)]';
      case 'problem-child':
        return 'bg-[var(--error-light)] text-[var(--error-dark)]';
      case 'dog':
        return 'bg-[var(--info-light)] text-[var(--info-dark)]';
      default:
        return 'bg-[var(--primary-light)] text-[var(--primary-dark)]';
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <StarIcon
        key={index}
        size={16}
        className={index < rating ? 'text-[var(--warning-main)]' : 'text-[var(--divider)]'}
        fill={index < rating ? 'currentColor' : 'none'}
      />
    ));
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-[var(--divider)]">
        <thead className="bg-[var(--background-paper)]">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Rating
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider">
              Last Order
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
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium flex items-center">
                    {customer.name}
                    {customer.strategic && (
                      <span className="ml-2 px-2 py-1 text-xs rounded-full bg-[var(--primary-light)] text-[var(--primary-dark)]">
                        Strategic
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-[var(--text-secondary)]">{customer.code}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(customer.category)}`}>
                  {customer.category.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-1">
                  {renderStars(customer.rating)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm">{customer.contactPerson}</div>
                <div className="text-sm text-[var(--text-secondary)]">{customer.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {customer.lastOrder}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[var(--success-light)] text-[var(--success-dark)]">
                  {customer.status}
                </span>
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
  );
};

export default CustomerGrid;
import React from 'react';
import { AlertTriangle, CheckCircle, Info, Clock } from 'lucide-react';
import Card from '../ui/Card';

interface Notification {
  id: number;
  type: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  time: string;
}

const notifications: Notification[] = [
  {
    id: 1,
    type: 'critical',
    title: 'High Priority Complaint',
    description: 'New complaint from Major Client requiring immediate attention',
    time: '5 min ago'
  },
  {
    id: 2,
    type: 'warning',
    title: 'Document Review Due',
    description: 'Quality Manual QM-001 is due for review in 5 days',
    time: '1 hour ago'
  },
  {
    id: 3,
    type: 'info',
    title: 'Audit Completed',
    description: 'Internal audit for Manufacturing dept. completed successfully',
    time: '2 hours ago'
  },
  {
    id: 4,
    type: 'warning',
    title: 'Training Deadline',
    description: 'ISO 9001:2015 refresher training deadline approaching',
    time: '3 hours ago'
  }
];

const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'critical':
        return <AlertTriangle className="text-[var(--error-main)]\" size={20} />;
      case 'warning':
        return <Clock className="text-[var(--warning-main)]" size={20} />;
      case 'info':
        return <Info className="text-[var(--info-main)]" size={20} />;
      default:
        return <CheckCircle className="text-[var(--success-main)]" size={20} />;
    }
  };

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-[var(--primary-main)] hover:bg-opacity-5 rounded-lg transition-colors cursor-pointer">
      <div className="mt-1">{getIcon()}</div>
      <div className="flex-1">
        <h4 className="text-sm font-medium">{notification.title}</h4>
        <p className="text-sm text-[var(--text-secondary)]">{notification.description}</p>
        <span className="text-xs text-[var(--text-secondary)]">{notification.time}</span>
      </div>
    </div>
  );
};

const NotificationsPanel: React.FC = () => {
  return (
    <Card 
      title="Notifications" 
      subtitle="Recent alerts and updates"
      className="h-full"
    >
      <div className="space-y-1">
        {notifications.map(notification => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>
    </Card>
  );
};

export default NotificationsPanel;
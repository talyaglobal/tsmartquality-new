import React from 'react';
import Card from '../ui/Card';
import { MoreVertical } from 'lucide-react';

interface Activity {
  id: number;
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
  iconColor: string;
}

interface RecentActivityCardProps {
  activities: Activity[];
}

const RecentActivityCard: React.FC<RecentActivityCardProps> = ({ activities }) => {
  return (
    <Card
      title="Recent Activities"
      actions={
        <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <MoreVertical size={20} />
        </button>
      }
      className="h-full"
    >
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex">
            <div className={`mt-1 mr-4 p-2 rounded-full ${activity.iconColor}`}>
              {activity.icon}
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <h6 className="font-medium">{activity.title}</h6>
                <span className="text-xs text-[var(--text-secondary)]">{activity.time}</span>
              </div>
              <p className="text-sm text-[var(--text-secondary)]">{activity.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RecentActivityCard;
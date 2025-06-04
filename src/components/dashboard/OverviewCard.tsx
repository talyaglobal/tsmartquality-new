import React from 'react';
import Card from '../ui/Card';

interface Stat {
  label: string;
  value: string;
}

interface ChartData {
  type: 'donut';
  data: number[];
  labels: string[];
}

interface OverviewCardProps {
  title: string;
  icon: React.ReactNode;
  stats: Stat[];
  chart: ChartData;
}

const OverviewCard: React.FC<OverviewCardProps> = ({ title, icon, stats, chart }) => {
  // Calculate total for percentage
  const total = chart.data.reduce((acc, curr) => acc + curr, 0);

  // Calculate stroke dash array for donut segments
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const center = { x: 50, y: 50 };

  let startAngle = -90; // Start from top

  return (
    <Card>
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 rounded-full bg-[var(--primary-main)] bg-opacity-10 text-[var(--primary-main)]">
          {icon}
        </div>
        <h3 className="font-medium">{title}</h3>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          {stats.map((stat, index) => (
            <div key={index}>
              <span className="text-sm text-[var(--text-secondary)]">{stat.label}: </span>
              <span className="font-medium">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* SVG Donut Chart */}
        <svg width="100" height="100" viewBox="0 0 100 100">
          {chart.data.map((value, index) => {
            const percentage = (value / total) * 100;
            const angle = (percentage / 100) * 360;
            const endAngle = startAngle + angle;
            
            // Calculate path
            const x1 = center.x + radius * Math.cos((startAngle * Math.PI) / 180);
            const y1 = center.y + radius * Math.sin((startAngle * Math.PI) / 180);
            const x2 = center.x + radius * Math.cos((endAngle * Math.PI) / 180);
            const y2 = center.y + radius * Math.sin((endAngle * Math.PI) / 180);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            const pathData = [
              `M ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            ].join(' ');

            const color = index === 0 ? 'var(--primary-main)' : 
                         index === 1 ? 'var(--info-main)' : 
                         'var(--warning-main)';

            startAngle = endAngle;

            return (
              <path
                key={index}
                d={pathData}
                fill="none"
                stroke={color}
                strokeWidth="12"
              />
            );
          })}
        </svg>
      </div>
    </Card>
  );
};

export default OverviewCard;
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface QualityStatusData {
  name: string;
  value: number;
  color: string;
}

interface QualityStatusChartProps {
  data?: QualityStatusData[];
}

const DEFAULT_DATA: QualityStatusData[] = [
  { name: 'Passed', value: 85, color: '#10B981' },
  { name: 'Failed', value: 10, color: '#EF4444' },
  { name: 'Pending', value: 5, color: '#F59E0B' },
];

export default function QualityStatusChart({ data = DEFAULT_DATA }: QualityStatusChartProps) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`${value}%`, 'Percentage']}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
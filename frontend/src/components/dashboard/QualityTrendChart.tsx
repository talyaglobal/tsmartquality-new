'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DataPoint {
  date: string;
  passed: number;
  failed: number;
  pending: number;
}

interface QualityTrendChartProps {
  data?: DataPoint[];
}

const DEFAULT_DATA: DataPoint[] = [
  { date: 'Jan', passed: 12, failed: 2, pending: 1 },
  { date: 'Feb', passed: 15, failed: 3, pending: 2 },
  { date: 'Mar', passed: 18, failed: 1, pending: 1 },
  { date: 'Apr', passed: 14, failed: 4, pending: 2 },
  { date: 'May', passed: 21, failed: 2, pending: 1 },
  { date: 'Jun', passed: 25, failed: 3, pending: 2 },
];

export default function QualityTrendChart({ data = DEFAULT_DATA }: QualityTrendChartProps) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="passed"
            stroke="#10B981"
            activeDot={{ r: 8 }}
          />
          <Line type="monotone" dataKey="failed" stroke="#EF4444" />
          <Line type="monotone" dataKey="pending" stroke="#F59E0B" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
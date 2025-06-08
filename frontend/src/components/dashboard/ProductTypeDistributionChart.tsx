'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface DataPoint {
  name: string;
  value: number;
}

interface ProductTypeDistributionChartProps {
  data?: DataPoint[];
}

const DEFAULT_DATA: DataPoint[] = [
  { name: 'Raw Material', value: 15 },
  { name: 'Semi-Product', value: 25 },
  { name: 'Finished Product', value: 35 },
];

export default function ProductTypeDistributionChart({ data = DEFAULT_DATA }: ProductTypeDistributionChartProps) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="value" fill="#0EA5E9" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
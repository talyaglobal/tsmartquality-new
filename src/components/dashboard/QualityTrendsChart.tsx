import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
  { date: '2024-03-01', qualityScore: 89, complaints: 15, auditScore: 92 },
  { date: '2024-03-02', qualityScore: 90, complaints: 12, auditScore: 94 },
  { date: '2024-03-03', qualityScore: 88, complaints: 18, auditScore: 91 },
  { date: '2024-03-04', qualityScore: 92, complaints: 10, auditScore: 95 },
  { date: '2024-03-05', qualityScore: 91, complaints: 14, auditScore: 93 },
  { date: '2024-03-06', qualityScore: 93, complaints: 9, auditScore: 96 },
  { date: '2024-03-07', qualityScore: 92, complaints: 11, auditScore: 94 },
];

const QualityTrendsChart: React.FC = () => {
  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--divider)" />
          <XAxis 
            dataKey="date" 
            stroke="var(--text-secondary)"
            tick={{ fill: 'var(--text-secondary)' }}
          />
          <YAxis 
            stroke="var(--text-secondary)"
            tick={{ fill: 'var(--text-secondary)' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--background-paper)',
              border: '1px solid var(--divider)',
              borderRadius: '8px'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="qualityScore" 
            stroke="var(--primary-main)" 
            name="Quality Score"
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="complaints" 
            stroke="var(--warning-main)" 
            name="Complaints"
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="auditScore" 
            stroke="var(--success-main)" 
            name="Audit Score"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default QualityTrendsChart;
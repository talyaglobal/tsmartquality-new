import React from 'react';
import { Users, BarChart2, AlertTriangle, ClipboardCheck, FileText, Calendar } from 'lucide-react';
import StatCard from './StatCard';
import QualityTrendsChart from './QualityTrendsChart';
import NotificationsPanel from './NotificationsPanel';
import OverviewCard from './OverviewCard';
import Card from '../ui/Card';

const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Quality Dashboard</h1>
        <p className="text-[var(--text-secondary)]">
          Real-time overview of quality metrics and performance indicators
        </p>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Quality Score"
          value="92.5%"
          change={{ value: 3.2, trend: 'up' }}
          icon={<BarChart2 size={20} />}
          variant="primary"
          details={{
            items: [
              { label: 'Last Month', value: '89.3%' },
              { label: 'Target', value: '95%' }
            ]
          }}
        />
        <StatCard
          title="Active Complaints"
          value="12"
          change={{ value: 2, trend: 'down' }}
          icon={<AlertTriangle size={20} />}
          variant="warning"
          details={{
            items: [
              { label: 'High Priority', value: '3' },
              { label: 'Medium Priority', value: '5' },
              { label: 'Low Priority', value: '4' }
            ]
          }}
        />
        <StatCard
          title="Compliance Rate"
          value="96.8%"
          change={{ value: 0.5, trend: 'up' }}
          icon={<ClipboardCheck size={20} />}
          variant="success"
          details={{
            items: [
              { label: 'Documents Up-to-date', value: '156' },
              { label: 'Pending Reviews', value: '8' }
            ]
          }}
        />
        <StatCard
          title="Training Progress"
          value="88.5%"
          change={{ value: 5.3, trend: 'up' }}
          icon={<Users size={20} />}
          variant="info"
          details={{
            items: [
              { label: 'Completed', value: '354' },
              { label: 'Pending', value: '46' }
            ]
          }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quality Trends Chart */}
        <div className="lg:col-span-2">
          <Card title="Quality Trends" subtitle="Performance metrics over time">
            <QualityTrendsChart />
          </Card>
        </div>

        {/* Notifications Panel */}
        <div>
          <NotificationsPanel />
        </div>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <OverviewCard
          title="Complaints Overview"
          icon={<AlertTriangle size={20} />}
          stats={[
            { label: 'Open', value: '12' },
            { label: 'In Progress', value: '8' },
            { label: 'Resolved', value: '45' }
          ]}
          chart={{
            type: 'donut',
            data: [12, 8, 45],
            labels: ['Open', 'In Progress', 'Resolved']
          }}
        />
        <OverviewCard
          title="Audit Status"
          icon={<ClipboardCheck size={20} />}
          stats={[
            { label: 'Scheduled', value: '6' },
            { label: 'Completed', value: '24' },
            { label: 'Findings', value: '15' }
          ]}
          chart={{
            type: 'donut',
            data: [6, 24, 15],
            labels: ['Scheduled', 'Completed', 'Findings']
          }}
        />
        <OverviewCard
          title="Document Status"
          icon={<FileText size={20} />}
          stats={[
            { label: 'Active', value: '156' },
            { label: 'For Review', value: '8' },
            { label: 'Expired', value: '3' }
          ]}
          chart={{
            type: 'donut',
            data: [156, 8, 3],
            labels: ['Active', 'For Review', 'Expired']
          }}
        />
        <OverviewCard
          title="Training Progress"
          icon={<Calendar size={20} />}
          stats={[
            { label: 'Completed', value: '354' },
            { label: 'In Progress', value: '89' },
            { label: 'Not Started', value: '46' }
          ]}
          chart={{
            type: 'donut',
            data: [354, 89, 46],
            labels: ['Completed', 'In Progress', 'Not Started']
          }}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
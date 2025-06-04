import React, { useState } from 'react';
import { BarChart2, TrendingUp, AlertTriangle, CheckCircle, Filter, Search, Download } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';

interface QualityMetric {
  id: string;
  category: string;
  score: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  lastUpdated: string;
  status: 'excellent' | 'good' | 'fair' | 'poor';
  issues?: number;
}

const QualityScorePage: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);

  // Sample data - replace with actual data from your API
  const metrics: QualityMetric[] = [
    {
      id: '1',
      category: 'Product Quality',
      score: 92,
      target: 95,
      trend: 'up',
      change: 2.5,
      lastUpdated: '2024-03-15',
      status: 'good',
      issues: 3
    },
    {
      id: '2',
      category: 'Process Compliance',
      score: 96,
      target: 98,
      trend: 'stable',
      change: 0,
      lastUpdated: '2024-03-15',
      status: 'excellent'
    },
    {
      id: '3',
      category: 'Documentation',
      score: 88,
      target: 90,
      trend: 'down',
      change: -1.5,
      lastUpdated: '2024-03-14',
      status: 'fair',
      issues: 5
    },
    {
      id: '4',
      category: 'Supplier Quality',
      score: 94,
      target: 92,
      trend: 'up',
      change: 3.2,
      lastUpdated: '2024-03-15',
      status: 'excellent'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-[var(--success-light)] text-[var(--success-dark)]';
      case 'good':
        return 'bg-[var(--info-light)] text-[var(--info-dark)]';
      case 'fair':
        return 'bg-[var(--warning-light)] text-[var(--warning-dark)]';
      case 'poor':
        return 'bg-[var(--error-light)] text-[var(--error-dark)]';
      default:
        return 'bg-[var(--primary-light)] text-[var(--primary-dark)]';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} className="text-[var(--success-main)]" />;
      case 'down':
        return <TrendingUp size={16} className="text-[var(--error-main)] transform rotate-180" />;
      default:
        return <TrendingUp size={16} className="text-[var(--warning-main)] transform rotate-90" />;
    }
  };

  const overallScore = metrics.reduce((acc, curr) => acc + curr.score, 0) / metrics.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">Quality Score</h1>
          <p className="text-[var(--text-secondary)]">
            Monitor and analyze quality performance metrics
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            icon={<Download size={20} />}
          >
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-[var(--primary-light)] text-[var(--primary-dark)]">
              <BarChart2 size={24} />
            </div>
            <div>
              <h3 className="font-medium">Overall Score</h3>
              <p className="text-2xl font-semibold">{overallScore.toFixed(1)}%</p>
            </div>
          </div>
          <div className="h-2 bg-[var(--divider)] rounded-full">
            <div 
              className="h-2 bg-[var(--primary-main)] rounded-full" 
              style={{ width: `${overallScore}%` }} 
            />
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-[var(--success-light)] text-[var(--success-dark)]">
              <CheckCircle size={24} />
            </div>
            <div>
              <h3 className="font-medium">Meeting Target</h3>
              <p className="text-2xl font-semibold">2/4</p>
            </div>
          </div>
          <div className="h-2 bg-[var(--divider)] rounded-full">
            <div className="h-2 bg-[var(--success-main)] rounded-full" style={{ width: '50%' }} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-[var(--warning-light)] text-[var(--warning-dark)]">
              <TrendingUp size={24} />
            </div>
            <div>
              <h3 className="font-medium">Improving</h3>
              <p className="text-2xl font-semibold">2</p>
            </div>
          </div>
          <div className="h-2 bg-[var(--divider)] rounded-full">
            <div className="h-2 bg-[var(--warning-main)] rounded-full" style={{ width: '50%' }} />
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 rounded-lg bg-[var(--error-light)] text-[var(--error-dark)]">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="font-medium">Open Issues</h3>
              <p className="text-2xl font-semibold">8</p>
            </div>
          </div>
          <div className="h-2 bg-[var(--divider)] rounded-full">
            <div className="h-2 bg-[var(--error-main)] rounded-full" style={{ width: '30%' }} />
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <div className="w-96">
            <Input
              placeholder="Search metrics..."
              startIcon={<Search size={20} />}
            />
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              icon={<Filter size={20} />}
            >
              Filter
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="mb-6 p-4 border border-[var(--divider)] rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Category
                </label>
                <select className="w-full border border-[var(--divider)] rounded-md p-2">
                  <option value="">All Categories</option>
                  <option value="product">Product Quality</option>
                  <option value="process">Process Compliance</option>
                  <option value="documentation">Documentation</option>
                  <option value="supplier">Supplier Quality</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Status
                </label>
                <select className="w-full border border-[var(--divider)] rounded-md p-2">
                  <option value="">All Status</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                  Trend
                </label>
                <select className="w-full border border-[var(--divider)] rounded-md p-2">
                  <option value="">All Trends</option>
                  <option value="up">Improving</option>
                  <option value="down">Declining</option>
                  <option value="stable">Stable</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {metrics.map((metric) => (
            <div
              key={metric.id}
              className="p-4 border border-[var(--divider)] rounded-lg hover:border-[var(--primary-main)] transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${getStatusColor(metric.status)}`}>
                    <BarChart2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium">{metric.category}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-[var(--text-secondary)]">
                        Target: {metric.target}%
                      </span>
                      <span className="text-sm text-[var(--text-secondary)]">
                        Last Updated: {metric.lastUpdated}
                      </span>
                      {metric.issues && (
                        <span className="text-sm text-[var(--error-main)]">
                          {metric.issues} open issues
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-semibold">{metric.score}%</span>
                    <div className="flex items-center">
                      {getTrendIcon(metric.trend)}
                      <span className={`text-sm ml-1 ${
                        metric.trend === 'up' ? 'text-[var(--success-main)]' :
                        metric.trend === 'down' ? 'text-[var(--error-main)]' :
                        'text-[var(--warning-main)]'
                      }`}>
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </span>
                    </div>
                  </div>
                  <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(metric.status)}`}>
                    {metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <div className="h-2 bg-[var(--divider)] rounded-full">
                  <div 
                    className={`h-2 rounded-full ${
                      metric.score >= 95 ? 'bg-[var(--success-main)]' :
                      metric.score >= 90 ? 'bg-[var(--info-main)]' :
                      metric.score >= 80 ? 'bg-[var(--warning-main)]' :
                      'bg-[var(--error-main)]'
                    }`}
                    style={{ width: `${metric.score}%` }} 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default QualityScorePage;
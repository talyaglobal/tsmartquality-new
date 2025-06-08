'use client';

import Link from 'next/link';
import QualityStatusChart from '@/components/dashboard/QualityStatusChart';
import QualityTrendChart from '@/components/dashboard/QualityTrendChart';
import ProductTypeDistributionChart from '@/components/dashboard/ProductTypeDistributionChart';

const stats = [
  { name: 'Total Products', stat: '142', href: '/dashboard/products' },
  { name: 'Quality Checks', stat: '1,237', href: '/dashboard/quality-checks' },
  { name: 'Passed Rate', stat: '98.5%', href: '/dashboard/reports' },
  { name: 'Open Issues', stat: '12', href: '/dashboard/issues' },
];

const recentActivity = [
  { 
    id: 1, 
    type: 'quality-check', 
    title: 'Quality check completed', 
    description: 'Product #A1542 passed quality inspection',
    date: '2 hours ago',
    status: 'passed'
  },
  { 
    id: 2, 
    type: 'product', 
    title: 'New product added', 
    description: 'Product #B7822 has been added to the system',
    date: '5 hours ago',
    status: 'info'
  },
  { 
    id: 3, 
    type: 'issue', 
    title: 'Quality issue reported', 
    description: 'Issue found with Product #C4411 - packaging defect',
    date: '1 day ago',
    status: 'failed'
  },
  { 
    id: 4, 
    type: 'quality-check', 
    title: 'Quality check completed', 
    description: 'Product #D9928 passed quality inspection',
    date: '1 day ago',
    status: 'passed'
  },
];

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      {/* Stats */}
      <div className="mt-6">
        <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.name}
              className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:pt-6"
            >
              <dt className="truncate text-sm font-medium text-gray-500">{item.name}</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{item.stat}</dd>
              <Link href={item.href} className="mt-2 inline-block text-sm font-medium text-primary-600 hover:text-primary-700">
                View details <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          ))}
        </dl>
      </div>

      {/* Charts */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Quality Status Distribution */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <h3 className="text-base font-medium text-gray-900">Quality Status Distribution</h3>
            <div className="mt-2">
              <QualityStatusChart />
            </div>
          </div>
        </div>

        {/* Product Type Distribution */}
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-6">
            <h3 className="text-base font-medium text-gray-900">Product Type Distribution</h3>
            <div className="mt-2">
              <ProductTypeDistributionChart />
            </div>
          </div>
        </div>

        {/* Quality Trend */}
        <div className="overflow-hidden rounded-lg bg-white shadow lg:col-span-2">
          <div className="p-6">
            <h3 className="text-base font-medium text-gray-900">Quality Trend (Last 6 Months)</h3>
            <div className="mt-2">
              <QualityTrendChart />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-lg font-medium leading-6 text-gray-900">Recent Activity</h2>
          <div className="mt-2 overflow-hidden rounded-lg bg-white shadow">
            <ul role="list" className="divide-y divide-gray-200">
              {recentActivity.map((activity) => (
                <li key={activity.id} className="px-6 py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {activity.status === 'passed' && (
                        <span className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                      )}
                      {activity.status === 'failed' && (
                        <span className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                          <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                      )}
                      {activity.status === 'info' && (
                        <span className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="truncate text-sm text-gray-500">{activity.description}</p>
                    </div>
                    <div className="flex-shrink-0 whitespace-nowrap text-sm text-gray-500">
                      {activity.date}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-gray-200 px-6 py-3">
              <Link href="/dashboard/activity" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                View all activity <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
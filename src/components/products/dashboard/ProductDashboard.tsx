import React from 'react'
import ProductTypeCard from './ProductTypeCard'
import ProductFlow from './ProductFlow'

const ProductDashboard: React.FC = () => {
  // Sample data - replace with actual data from your API
  const productTypeStats = {
    HM: {
      totalCount: 156,
      activeItems: 142,
      qualityScore: 94,
      alerts: 3
    },
    YM: {
      totalCount: 89,
      activeItems: 76,
      qualityScore: 91,
      alerts: 2
    },
    MM: {
      totalCount: 234,
      activeItems: 198,
      qualityScore: 96,
      alerts: 1
    },
    TM: {
      totalCount: 67,
      activeItems: 58,
      qualityScore: 92,
      alerts: 0
    }
  }

  const productFlowSteps = [
    {
      id: '1',
      name: 'Raw Materials',
      status: 'completed' as const,
      completionPercentage: 100
    },
    {
      id: '2',
      name: 'Processing',
      status: 'in-progress' as const,
      completionPercentage: 65
    },
    {
      id: '3',
      name: 'Quality Check',
      status: 'pending' as const,
      completionPercentage: 0
    },
    {
      id: '4',
      name: 'Packaging',
      status: 'pending' as const,
      completionPercentage: 0
    }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProductTypeCard type="HM" stats={productTypeStats.HM} />
        <ProductTypeCard type="YM" stats={productTypeStats.YM} />
        <ProductTypeCard type="MM" stats={productTypeStats.MM} />
        <ProductTypeCard type="TM" stats={productTypeStats.TM} />
      </div>

      <ProductFlow steps={productFlowSteps} />
    </div>
  )
}

export default ProductDashboard
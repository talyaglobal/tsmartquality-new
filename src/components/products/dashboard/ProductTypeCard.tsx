import React from 'react'
import { Wheat, Cog, Package, Tangent as Exchange } from 'lucide-react'
import Card from '../../ui/Card'

interface ProductTypeCardProps {
  type: 'HM' | 'YM' | 'MM' | 'TM'
  stats: {
    totalCount: number
    activeItems: number
    qualityScore: number
    alerts: number
  }
}

const ProductTypeCard: React.FC<ProductTypeCardProps> = ({ type, stats }) => {
  const getTypeConfig = () => {
    switch (type) {
      case 'HM':
        return {
          title: 'Raw Products',
          icon: Wheat,
          color: 'bg-[#8B4513]',
          lightColor: 'bg-[#8B4513]/10',
        }
      case 'YM':
        return {
          title: 'Half Products',
          icon: Cog,
          color: 'bg-[#FF8C00]',
          lightColor: 'bg-[#FF8C00]/10',
        }
      case 'MM':
        return {
          title: 'Products',
          icon: Package,
          color: 'bg-[#4CAF50]',
          lightColor: 'bg-[#4CAF50]/10',
        }
      case 'TM':
        return {
          title: 'Traded Products',
          icon: Exchange,
          color: 'bg-[#2196F3]',
          lightColor: 'bg-[#2196F3]/10',
        }
    }
  }

  const config = getTypeConfig()
  const Icon = config.icon

  return (
    <Card className="h-full">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <div className={`p-2 rounded-lg ${config.lightColor}`}>
              <Icon className={`h-5 w-5 ${config.color.replace('bg-', 'text-')}`} />
            </div>
            <h3 className="font-medium">{config.title}</h3>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-2xl font-semibold">{stats.totalCount}</p>
              <p className="text-sm text-[var(--text-secondary)]">Total Items</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-lg font-medium">{stats.activeItems}</p>
                <p className="text-sm text-[var(--text-secondary)]">Active</p>
              </div>
              <div>
                <p className="text-lg font-medium">{stats.qualityScore}%</p>
                <p className="text-sm text-[var(--text-secondary)]">Quality Score</p>
              </div>
            </div>

            {stats.alerts > 0 && (
              <div className="bg-[var(--error-light)] text-[var(--error-dark)] p-2 rounded-lg text-sm">
                {stats.alerts} alerts require attention
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default ProductTypeCard
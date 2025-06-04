import React from 'react'
import { ArrowRight } from 'lucide-react'
import Card from '../../ui/Card'

interface FlowStep {
  id: string
  name: string
  status: 'pending' | 'in-progress' | 'completed' | 'hold'
  completionPercentage: number
}

interface ProductFlowProps {
  steps: FlowStep[]
}

const ProductFlow: React.FC<ProductFlowProps> = ({ steps }) => {
  return (
    <Card title="Product Flow & Recipe Tracking">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex-1">
              <div className={`p-4 rounded-lg border ${
                step.status === 'completed' ? 'border-[var(--success-main)] bg-[var(--success-light)]' :
                step.status === 'in-progress' ? 'border-[var(--primary-main)] bg-[var(--primary-light)]' :
                step.status === 'hold' ? 'border-[var(--warning-main)] bg-[var(--warning-light)]' :
                'border-[var(--divider)]'
              }`}>
                <p className="font-medium mb-2">{step.name}</p>
                <div className="w-full bg-[var(--divider)] rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      step.status === 'completed' ? 'bg-[var(--success-main)]' :
                      step.status === 'in-progress' ? 'bg-[var(--primary-main)]' :
                      step.status === 'hold' ? 'bg-[var(--warning-main)]' :
                      'bg-[var(--divider)]'
                    }`}
                    style={{ width: `${step.completionPercentage}%` }}
                  />
                </div>
                <p className="text-sm text-[var(--text-secondary)] mt-2">
                  {step.completionPercentage}% Complete
                </p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <ArrowRight className="mx-4 text-[var(--text-secondary)]" />
            )}
          </React.Fragment>
        ))}
      </div>
    </Card>
  )
}

export default ProductFlow
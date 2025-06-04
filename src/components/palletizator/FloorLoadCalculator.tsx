import React, { useState } from 'react'
import { Package, Scale, Ruler, Truck, Container } from 'lucide-react'
import Card from '../ui/Card'
import Input from '../ui/Input'
import Button from '../ui/Button'

interface BoxDimensions {
  width: number
  length: number
  height: number
  weight: number
}

interface ContainerConfig {
  type: string
  length: number
  width: number
  height: number
  maxWeight: number
  description: string
}

const containerConfigs: Record<string, ContainerConfig> = {
  '20DC': {
    type: '20ft Dry Container',
    length: 590, // cm
    width: 235, // cm
    height: 239, // cm
    maxWeight: 21727, // kg
    description: '20ft Standard Dry Container'
  },
  '20RF': {
    type: '20ft Reefer Container',
    length: 550, // cm
    width: 226, // cm
    height: 226, // cm
    maxWeight: 20000, // kg
    description: '20ft Refrigerated Container'
  },
  '40DC': {
    type: '40ft Dry Container',
    length: 1203, // cm
    width: 235, // cm
    height: 239, // cm
    maxWeight: 26780, // kg
    description: '40ft Standard Dry Container'
  },
  '40RF': {
    type: '40ft Reefer Container',
    length: 1160, // cm
    width: 226, // cm
    height: 226, // cm
    maxWeight: 25000, // kg
    description: '40ft Refrigerated Container'
  },
  'TRUCKDC': {
    type: 'Truck (Dry)',
    length: 1360, // cm
    width: 250, // cm
    height: 270, // cm
    maxWeight: 24000, // kg
    description: 'Standard Dry Truck'
  },
  'TRUCKRF': {
    type: 'Truck (Reefer)',
    length: 1340, // cm
    width: 248, // cm
    height: 265, // cm
    maxWeight: 22000, // kg
    description: 'Refrigerated Truck'
  }
}

const FloorLoadCalculator: React.FC = () => {
  const [boxDimensions, setBoxDimensions] = useState<BoxDimensions>({
    width: 0,
    length: 0,
    height: 0,
    weight: 0
  })

  const [selectedContainer, setSelectedContainer] = useState<string>('20DC')
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric')

  const convertToImperial = (value: number, dimension: 'length' | 'weight') => {
    if (dimension === 'length') {
      return (value * 0.393701).toFixed(2) // cm to inches
    } else {
      return (value * 2.20462).toFixed(2) // kg to lbs
    }
  }

  const convertToMetric = (value: number, dimension: 'length' | 'weight') => {
    if (dimension === 'length') {
      return (value * 2.54).toFixed(2) // inches to cm
    } else {
      return (value * 0.453592).toFixed(2) // lbs to kg
    }
  }

  const calculateLayout = () => {
    const container = containerConfigs[selectedContainer]
    
    // Calculate how many boxes fit in each dimension
    const lengthwiseCount = Math.floor(container.length / boxDimensions.length)
    const widthwiseCount = Math.floor(container.width / boxDimensions.width)
    const heightwiseCount = Math.floor(container.height / boxDimensions.height)
    
    const boxesPerLayer = lengthwiseCount * widthwiseCount
    const totalBoxes = boxesPerLayer * heightwiseCount
    const totalWeight = totalBoxes * boxDimensions.weight

    // Calculate space utilization
    const volumeUtilization = (
      (boxDimensions.length * boxDimensions.width * boxDimensions.height * totalBoxes) /
      (container.length * container.width * container.height)
    ) * 100

    return {
      boxesPerLayer,
      layers: heightwiseCount,
      totalBoxes,
      totalWeight,
      volumeUtilization: Math.min(volumeUtilization, 100),
      isOverweight: totalWeight > container.maxWeight
    }
  }

  const handleDimensionChange = (dimension: keyof BoxDimensions, value: string) => {
    const numValue = parseFloat(value) || 0
    setBoxDimensions(prev => ({
      ...prev,
      [dimension]: numValue
    }))
  }

  const toggleUnit = () => {
    if (unit === 'metric') {
      setBoxDimensions({
        width: parseFloat(convertToImperial(boxDimensions.width, 'length')),
        length: parseFloat(convertToImperial(boxDimensions.length, 'length')),
        height: parseFloat(convertToImperial(boxDimensions.height, 'length')),
        weight: parseFloat(convertToImperial(boxDimensions.weight, 'weight'))
      })
      setUnit('imperial')
    } else {
      setBoxDimensions({
        width: parseFloat(convertToMetric(boxDimensions.width, 'length')),
        length: parseFloat(convertToMetric(boxDimensions.length, 'length')),
        height: parseFloat(convertToMetric(boxDimensions.height, 'length')),
        weight: parseFloat(convertToMetric(boxDimensions.weight, 'weight'))
      })
      setUnit('metric')
    }
  }

  const layout = calculateLayout()
  const container = containerConfigs[selectedContainer]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Floor Load Calculator</h1>
        <p className="text-[var(--text-secondary)]">
          Calculate optimal box arrangement for various container types
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Container Selection</h2>
            <Button variant="outline" onClick={toggleUnit}>
              {unit === 'metric' ? 'Switch to Imperial' : 'Switch to Metric'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Container Type
              </label>
              <select
                className="w-full border border-[var(--divider)] rounded-md p-2"
                value={selectedContainer}
                onChange={(e) => setSelectedContainer(e.target.value)}
              >
                <option value="20DC">20ft Dry Container</option>
                <option value="20RF">20ft Reefer Container</option>
                <option value="40DC">40ft Dry Container</option>
                <option value="40RF">40ft Reefer Container</option>
                <option value="TRUCKDC">Truck (Dry)</option>
                <option value="TRUCKRF">Truck (Reefer)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={`Length (${unit === 'metric' ? 'cm' : 'in'})`}
              type="number"
              value={boxDimensions.length || ''}
              onChange={(e) => handleDimensionChange('length', e.target.value)}
              startIcon={<Ruler size={20} />}
            />
            <Input
              label={`Width (${unit === 'metric' ? 'cm' : 'in'})`}
              type="number"
              value={boxDimensions.width || ''}
              onChange={(e) => handleDimensionChange('width', e.target.value)}
              startIcon={<Ruler size={20} />}
            />
            <Input
              label={`Height (${unit === 'metric' ? 'cm' : 'in'})`}
              type="number"
              value={boxDimensions.height || ''}
              onChange={(e) => handleDimensionChange('height', e.target.value)}
              startIcon={<Ruler size={20} />}
            />
            <Input
              label={`Weight (${unit === 'metric' ? 'kg' : 'lb'})`}
              type="number"
              value={boxDimensions.weight || ''}
              onChange={(e) => handleDimensionChange('weight', e.target.value)}
              startIcon={<Scale size={20} />}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold mb-6">Loading Configuration</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-[var(--background-default)] rounded-lg">
                <p className="text-sm text-[var(--text-secondary)]">Boxes per Layer</p>
                <p className="text-2xl font-semibold mt-1">{layout.boxesPerLayer}</p>
              </div>
              <div className="p-4 bg-[var(--background-default)] rounded-lg">
                <p className="text-sm text-[var(--text-secondary)]">Number of Layers</p>
                <p className="text-2xl font-semibold mt-1">{layout.layers}</p>
              </div>
            </div>

            <div className="p-4 bg-[var(--background-default)] rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Total Boxes</p>
                  <p className="text-2xl font-semibold mt-1">{layout.totalBoxes}</p>
                </div>
                <Package size={32} className="text-[var(--primary-main)]" />
              </div>
            </div>

            <div className="p-4 bg-[var(--background-default)] rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Total Weight</p>
                  <p className="text-2xl font-semibold mt-1">
                    {layout.totalWeight.toFixed(2)} {unit === 'metric' ? 'kg' : 'lb'}
                  </p>
                </div>
                <Scale size={32} className={layout.isOverweight ? 'text-[var(--error-main)]' : 'text-[var(--success-main)]'} />
              </div>
              {layout.isOverweight && (
                <p className="text-sm text-[var(--error-main)] mt-2">
                  Warning: Exceeds maximum weight limit of {unit === 'metric' ? 
                    `${container.maxWeight} kg` : 
                    `${parseFloat(convertToImperial(container.maxWeight, 'weight'))} lb`}
                </p>
              )}
            </div>

            <div className="p-4 bg-[var(--background-default)] rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--text-secondary)]">Volume Utilization</p>
                  <p className="text-2xl font-semibold mt-1">{layout.volumeUtilization.toFixed(1)}%</p>
                </div>
                {selectedContainer.includes('TRUCK') ? 
                  <Truck size={32} className="text-[var(--primary-main)]" /> :
                  <Container size={32} className="text-[var(--primary-main)]" />
                }
              </div>
            </div>

            <div className="border-t border-[var(--divider)] pt-4">
              <h3 className="font-medium mb-2">Container Specifications:</h3>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li>• Type: {container.type}</li>
                <li>• Internal Length: {unit === 'metric' ? 
                  `${container.length} cm` : 
                  `${parseFloat(convertToImperial(container.length, 'length'))} in`}</li>
                <li>• Internal Width: {unit === 'metric' ? 
                  `${container.width} cm` : 
                  `${parseFloat(convertToImperial(container.width, 'length'))} in`}</li>
                <li>• Internal Height: {unit === 'metric' ? 
                  `${container.height} cm` : 
                  `${parseFloat(convertToImperial(container.height, 'length'))} in`}</li>
                <li>• Maximum Weight: {unit === 'metric' ? 
                  `${container.maxWeight} kg` : 
                  `${parseFloat(convertToImperial(container.maxWeight, 'weight'))} lb`}</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default FloorLoadCalculator
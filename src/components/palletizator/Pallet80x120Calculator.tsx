import React, { useState } from 'react'
import { Package, Scale, Ruler } from 'lucide-react'
import Card from '../ui/Card'
import Input from '../ui/Input'
import Button from '../ui/Button'

interface BoxDimensions {
  width: number
  length: number
  height: number
  weight: number
}

interface PalletConfig {
  maxHeight: number
  maxWeight: number
  width: number
  length: number
}

const Pallet80x120Calculator: React.FC = () => {
  const [boxDimensions, setBoxDimensions] = useState<BoxDimensions>({
    width: 0,
    length: 0,
    height: 0,
    weight: 0
  })

  const [shipmentType, setShipmentType] = useState<'DC' | 'RF'>('DC')

  // 80x120 Euro pallet configuration
  const palletConfigs: Record<'DC' | 'RF', PalletConfig> = {
    DC: {
      width: 80, // cm
      length: 120, // cm
      maxHeight: 180, // cm
      maxWeight: 800 // kg
    },
    RF: {
      width: 80, // cm
      length: 120, // cm
      maxHeight: 155, // cm
      maxWeight: 800 // kg
    }
  }

  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric')

  const convertToImperial = (value: number, dimension: 'length' | 'weight') => {
    if (dimension === 'length') {
      // Convert cm to inches
      return (value * 0.393701).toFixed(2)
    } else {
      // Convert kg to lbs
      return (value * 2.20462).toFixed(2)
    }
  }

  const convertToMetric = (value: number, dimension: 'length' | 'weight') => {
    if (dimension === 'length') {
      // Convert inches to cm
      return (value * 2.54).toFixed(2)
    } else {
      // Convert lbs to kg
      return (value * 0.453592).toFixed(2)
    }
  }

  const calculatePalletLayout = () => {
    const palletConfig = palletConfigs[shipmentType]
    const lengthwiseCount = Math.floor(palletConfig.length / boxDimensions.length)
    const widthwiseCount = Math.floor(palletConfig.width / boxDimensions.width)
    const heightLayers = Math.floor(palletConfig.maxHeight / boxDimensions.height)
    
    const boxesPerLayer = lengthwiseCount * widthwiseCount
    const totalBoxes = boxesPerLayer * heightLayers
    const totalWeight = totalBoxes * boxDimensions.weight

    return {
      boxesPerLayer,
      layers: heightLayers,
      totalBoxes,
      totalWeight,
      isOverweight: totalWeight > palletConfig.maxWeight
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
      // Convert to imperial
      setBoxDimensions({
        width: parseFloat(convertToImperial(boxDimensions.width, 'length')),
        length: parseFloat(convertToImperial(boxDimensions.length, 'length')),
        height: parseFloat(convertToImperial(boxDimensions.height, 'length')),
        weight: parseFloat(convertToImperial(boxDimensions.weight, 'weight'))
      })
      setUnit('imperial')
    } else {
      // Convert to metric
      setBoxDimensions({
        width: parseFloat(convertToMetric(boxDimensions.width, 'length')),
        length: parseFloat(convertToMetric(boxDimensions.length, 'length')),
        height: parseFloat(convertToMetric(boxDimensions.height, 'length')),
        weight: parseFloat(convertToMetric(boxDimensions.weight, 'weight'))
      })
      setUnit('metric')
    }
  }

  const layout = calculatePalletLayout()
  const palletConfig = palletConfigs[shipmentType]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">80x120 Pallet Calculator</h1>
        <p className="text-[var(--text-secondary)]">
          Calculate optimal box arrangement for an 80x120 Euro pallet
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Box Dimensions</h2>
            <Button variant="outline" onClick={toggleUnit}>
              {unit === 'metric' ? 'Switch to Imperial' : 'Switch to Metric'}
            </Button>
          </div>

          <div className="mb-6">
            <div className="flex space-x-4">
              <Button
                variant={shipmentType === 'DC' ? 'primary' : 'outline'}
                onClick={() => setShipmentType('DC')}
                icon={<Package size={20} />}
              >
                DC
              </Button>
              <Button
                variant={shipmentType === 'RF' ? 'primary' : 'outline'}
                onClick={() => setShipmentType('RF')}
                icon={<Package size={20} />}
              >
                RF
              </Button>
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
          <h2 className="text-lg font-semibold mb-6">Pallet Configuration</h2>
          
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
                  Warning: Exceeds maximum weight limit of {unit === 'metric' ? '800 kg' : '1763.70 lb'}
                </p>
              )}
            </div>

            <div className="border-t border-[var(--divider)] pt-4">
              <h3 className="font-medium mb-2">Pallet Specifications:</h3>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li>• Dimensions: 80 x 120 cm (31.50 x 47.24 in)</li>
                <li>• Maximum Height: {unit === 'metric' ? 
                  `${palletConfig.maxHeight} cm` : 
                  `${convertToImperial(palletConfig.maxHeight, 'length')} in`}
                </li>
                <li>• Maximum Weight: {unit === 'metric' ? 
                  `${palletConfig.maxWeight} kg` : 
                  `${convertToImperial(palletConfig.maxWeight, 'weight')} lb`}
                </li>
                <li>• Type: {shipmentType === 'RF' ? 'Refrigerated' : 'Dry Container'}</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Pallet80x120Calculator
import React, { useState } from 'react'
import { Table, Link2, Settings } from 'lucide-react'
import Card from '../ui/Card'
import Button from '../ui/Button'
import Input from '../ui/Input'

interface ColumnMapping {
  sheetColumn: string
  systemField: string
}

interface ModuleMapping {
  id: string
  name: string
  sheetUrl: string
  columnMappings: ColumnMapping[]
}

const ImportSettings: React.FC = () => {
  const [modules, setModules] = useState<ModuleMapping[]>([
    {
      id: '1',
      name: 'Products',
      sheetUrl: '',
      columnMappings: []
    },
    {
      id: '2',
      name: 'Recipes',
      sheetUrl: '',
      columnMappings: []
    },
    {
      id: '3',
      name: 'Suppliers',
      sheetUrl: '',
      columnMappings: []
    }
  ])

  const [activeModule, setActiveModule] = useState<ModuleMapping | null>(null)
  const [showMappingForm, setShowMappingForm] = useState(false)

  const handleSheetUrlUpdate = (moduleId: string, url: string) => {
    setModules(modules.map(mod => 
      mod.id === moduleId ? { ...mod, sheetUrl: url } : mod
    ))
  }

  const handleAddMapping = (moduleId: string, mapping: ColumnMapping) => {
    setModules(modules.map(mod => 
      mod.id === moduleId ? {
        ...mod,
        columnMappings: [...mod.columnMappings, mapping]
      } : mod
    ))
  }

  const handleRemoveMapping = (moduleId: string, index: number) => {
    setModules(modules.map(mod => 
      mod.id === moduleId ? {
        ...mod,
        columnMappings: mod.columnMappings.filter((_, i) => i !== index)
      } : mod
    ))
  }

  const getSystemFields = (moduleName: string) => {
    switch (moduleName) {
      case 'Products':
        return ['name', 'code', 'description', 'specifications', 'status']
      case 'Recipes':
        return ['name', 'code', 'category', 'version', 'ingredients', 'instructions']
      case 'Suppliers':
        return ['name', 'code', 'category', 'contactPerson', 'email', 'phone']
      default:
        return []
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold">Google Sheets Import Settings</h2>
            <p className="text-[var(--text-secondary)]">
              Configure Google Sheets integration for data import
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {modules.map(module => (
            <div key={module.id} className="border border-[var(--divider)] rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Table size={20} className="text-[var(--primary-main)]" />
                  <h3 className="font-medium">{module.name}</h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Settings size={16} />}
                  onClick={() => {
                    setActiveModule(module)
                    setShowMappingForm(true)
                  }}
                >
                  Configure Mapping
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Link2 size={16} className="text-[var(--text-secondary)]" />
                  <Input
                    placeholder="Enter Google Sheet URL"
                    value={module.sheetUrl}
                    onChange={(e) => handleSheetUrlUpdate(module.id, e.target.value)}
                    className="flex-1"
                  />
                </div>

                {module.columnMappings.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Column Mappings</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {module.columnMappings.map((mapping, index) => (
                        <div key={index} className="flex items-center justify-between bg-[var(--background-default)] p-2 rounded">
                          <span className="text-sm">
                            {mapping.sheetColumn} → {mapping.systemField}
                          </span>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRemoveMapping(module.id, index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {showMappingForm && activeModule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-[600px]">
              <h3 className="text-lg font-medium mb-4">Configure Column Mapping</h3>
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target as HTMLFormElement)
                handleAddMapping(activeModule.id, {
                  sheetColumn: formData.get('sheetColumn') as string,
                  systemField: formData.get('systemField') as string
                })
                setShowMappingForm(false)
              }}>
                <div className="space-y-4">
                  <Input
                    name="sheetColumn"
                    label="Sheet Column Name"
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                      System Field
                    </label>
                    <select
                      name="systemField"
                      className="w-full border border-[var(--divider)] rounded-md p-2"
                      required
                    >
                      <option value="">Select field</option>
                      {getSystemFields(activeModule.name).map(field => (
                        <option key={field} value={field}>
                          {field}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowMappingForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Add Mapping
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}

export default ImportSettings
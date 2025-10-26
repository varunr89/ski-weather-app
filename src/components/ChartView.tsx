import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { CsvData } from '@/hooks/useCsvData'
import { formatDateColumn } from '@/lib/dataFormatters'

interface ChartViewProps {
  data: CsvData
}

const LOCATION_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'oklch(0.65 0.15 330)',
  'oklch(0.70 0.12 150)',
  'oklch(0.60 0.18 280)',
  'oklch(0.75 0.10 60)',
  'oklch(0.55 0.20 190)',
]

const LINE_STYLES = [
  { strokeDasharray: '0', shape: 'circle' },
  { strokeDasharray: '5 5', shape: 'square' },
  { strokeDasharray: '10 5', shape: 'triangle' },
  { strokeDasharray: '3 3', shape: 'diamond' },
  { strokeDasharray: '8 4 2 4', shape: 'star' },
]

export function ChartView({ data }: ChartViewProps) {
  const { headers, rows } = data

  const firstColumnKey = headers[0]
  const locations = useMemo(() => {
    return rows.map(row => row[firstColumnKey]).filter(Boolean)
  }, [rows, firstColumnKey])

  const dateColumns = useMemo(() => {
    return headers.slice(1).filter(col => !col.toLowerCase().includes('current datetime'))
  }, [headers])

  const variables = useMemo(() => {
    const allVars = new Set<string>()
    dateColumns.forEach(dateCol => {
      rows.forEach(row => {
        const value = row[dateCol]
        if (value) {
          const parts = value.split('\n')
          parts.forEach(part => {
            const colonIndex = part.indexOf(':')
            if (colonIndex > 0) {
              const varName = part.substring(0, colonIndex).trim()
              if (varName && !varName.toLowerCase().includes('index')) {
                allVars.add(varName)
              }
            }
          })
        }
      })
    })
    return Array.from(allVars).sort()
  }, [rows, dateColumns])

  const [selectedLocations, setSelectedLocations] = useState<string[]>([locations[0] || ''])
  const [selectedVariables, setSelectedVariables] = useState<string[]>([variables[0] || ''])

  const toggleLocation = (location: string) => {
    setSelectedLocations(prev => 
      prev.includes(location) 
        ? prev.filter(l => l !== location)
        : [...prev, location]
    )
  }

  const toggleVariable = (variable: string) => {
    setSelectedVariables(prev => 
      prev.includes(variable)
        ? prev.filter(v => v !== variable)
        : [...prev, variable]
    )
  }

  const { chartData, variableUnits, variableScales } = useMemo(() => {
    if (selectedLocations.length === 0 || selectedVariables.length === 0) {
      return { chartData: [], variableUnits: new Map(), variableScales: new Map() }
    }

    const units = new Map<string, string>()
    const scales = new Map<string, { min: number; max: number }>()

    const allDataPoints = dateColumns.map(dateCol => {
      const point: Record<string, any> = {
        date: dateCol,
        dateLabel: formatDateColumn(dateCol),
      }

      selectedLocations.forEach(location => {
        const locationRow = rows.find(row => row[firstColumnKey] === location)
        if (!locationRow) return

        selectedVariables.forEach(variable => {
          const cellValue = locationRow[dateCol] || ''
          const lines = cellValue.split('\n')

          for (const line of lines) {
            if (line.toLowerCase().includes(variable.toLowerCase())) {
              const colonIndex = line.indexOf(':')
              if (colonIndex > 0) {
                const valueStr = line.substring(colonIndex + 1).trim()
                const numMatch = valueStr.match(/-?\d+\.?\d*/)
                if (numMatch) {
                  const value = parseFloat(numMatch[0])
                  const key = `${location}__${variable}`
                  point[key] = value

                  if (!units.has(variable)) {
                    if (valueStr.includes('°F')) units.set(variable, '°F')
                    else if (valueStr.includes('°C')) units.set(variable, '°C')
                    else if (valueStr.includes('mph')) units.set(variable, 'mph')
                    else if (valueStr.includes('in')) units.set(variable, 'in')
                    else if (valueStr.includes('cm')) units.set(variable, 'cm')
                    else if (valueStr.includes('%')) units.set(variable, '%')
                    else if (valueStr.includes('ft')) units.set(variable, 'ft')
                    else if (valueStr.includes('m')) units.set(variable, 'm')
                  }

                  const currentScale = scales.get(variable)
                  if (currentScale) {
                    scales.set(variable, {
                      min: Math.min(currentScale.min, value),
                      max: Math.max(currentScale.max, value)
                    })
                  } else {
                    scales.set(variable, { min: value, max: value })
                  }
                }
                break
              }
            }
          }
        })
      })

      return point
    })

    return { chartData: allDataPoints, variableUnits: units, variableScales: scales }
  }, [selectedLocations, selectedVariables, rows, dateColumns, firstColumnKey])

  const needsMultipleAxes = useMemo(() => {
    if (selectedVariables.length <= 1) return false

    const scalesArray = Array.from(variableScales.entries())
    for (let i = 0; i < scalesArray.length - 1; i++) {
      for (let j = i + 1; j < scalesArray.length; j++) {
        const [, scale1] = scalesArray[i]
        const [, scale2] = scalesArray[j]
        
        const range1 = scale1.max - scale1.min
        const range2 = scale2.max - scale2.min
        const maxRange = Math.max(range1, range2)
        const minRange = Math.min(range1, range2)
        
        if (maxRange > minRange * 3) {
          return true
        }
      }
    }
    return false
  }, [selectedVariables, variableScales])

  if (locations.length === 0 || variables.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardContent className="py-8 text-center text-muted-foreground">
          No data available for charting
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Forecast Visualization</CardTitle>
        {data.timestamp && (
          <p className="text-sm text-muted-foreground mt-2">
            {data.timestamp}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-3">
            <Label className="text-base font-semibold">Locations</Label>
            <ScrollArea className="w-full">
              <div className="flex flex-wrap gap-4 pb-2">
                {locations.map(location => (
                  <div key={location} className="flex items-center space-x-2 whitespace-nowrap">
                    <Checkbox
                      id={`location-${location}`}
                      checked={selectedLocations.includes(location)}
                      onCheckedChange={() => toggleLocation(location)}
                    />
                    <label
                      htmlFor={`location-${location}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {location}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="space-y-3">
            <Label className="text-base font-semibold">Variables</Label>
            <ScrollArea className="w-full">
              <div className="flex flex-wrap gap-4 pb-2">
                {variables.map(variable => (
                  <div key={variable} className="flex items-center space-x-2 whitespace-nowrap">
                    <Checkbox
                      id={`variable-${variable}`}
                      checked={selectedVariables.includes(variable)}
                      onCheckedChange={() => toggleVariable(variable)}
                    />
                    <label
                      htmlFor={`variable-${variable}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {variable}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {chartData.length > 0 && selectedLocations.length > 0 && selectedVariables.length > 0 ? (
          <div className="w-full h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: needsMultipleAxes ? 60 : 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                  tickFormatter={(value) => {
                    const date = new Date(value + 'T00:00:00')
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  }}
                />
                
                {needsMultipleAxes ? (
                  selectedVariables.map((variable, idx) => (
                    <YAxis
                      key={variable}
                      yAxisId={variable}
                      orientation={idx % 2 === 0 ? 'left' : 'right'}
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--foreground))' }}
                      label={{
                        value: `${variable} (${variableUnits.get(variable) || ''})`,
                        angle: -90,
                        position: idx % 2 === 0 ? 'insideLeft' : 'insideRight',
                        style: { fill: 'hsl(var(--foreground))', fontSize: '12px' }
                      }}
                    />
                  ))
                ) : (
                  <YAxis
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--foreground))' }}
                    label={{
                      value: selectedVariables.length === 1 ? variableUnits.get(selectedVariables[0]) || '' : 'Value',
                      angle: -90,
                      position: 'insideLeft',
                      style: { fill: 'hsl(var(--foreground))' }
                    }}
                  />
                )}
                
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                    color: 'hsl(var(--popover-foreground))'
                  }}
                  labelFormatter={(value) => formatDateColumn(value as string)}
                />
                <Legend 
                  wrapperStyle={{ color: 'hsl(var(--foreground))' }}
                />
                
                {selectedLocations.flatMap((location, locIdx) =>
                  selectedVariables.map((variable, varIdx) => {
                    const key = `${location}__${variable}`
                    const color = LOCATION_COLORS[locIdx % LOCATION_COLORS.length]
                    const lineStyle = LINE_STYLES[varIdx % LINE_STYLES.length]
                    
                    const lineProps: any = {
                      type: "monotone",
                      dataKey: key,
                      stroke: color,
                      strokeWidth: 2,
                      strokeDasharray: lineStyle.strokeDasharray,
                      dot: { fill: color, r: 3 },
                      activeDot: { r: 5 },
                      name: `${location} - ${variable}`,
                      connectNulls: true
                    }
                    
                    if (needsMultipleAxes) {
                      lineProps.yAxisId = variable
                    }
                    
                    return <Line key={key} {...lineProps} />
                  })
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Please select at least one location and one variable to view the chart
          </div>
        )}
      </CardContent>
    </Card>
  )
}

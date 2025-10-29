import { useState, useMemo, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CsvData } from '@/hooks/useCsvData'
import { formatDateColumn } from '@/lib/dataFormatters'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface ChartViewProps {
  data: CsvData
}

type ChartPoint = {
  date: string
  dateLabel: string
} & Record<string, number | string | undefined>

const LOCATION_COLORS = [
  'rgb(255, 99, 132)',
  'rgb(54, 162, 235)',
  'rgb(255, 206, 86)',
  'rgb(75, 192, 192)',
  'rgb(153, 102, 255)',
  'rgb(255, 159, 64)',
  'rgb(201, 203, 207)',
  'rgb(83, 102, 255)',
  'rgb(255, 99, 255)',
  'rgb(99, 255, 132)',
]

const LINE_DASH_PATTERNS = [
  [],
  [5, 5],
  [10, 5],
  [3, 3],
  [8, 4, 2, 4],
]

const POINT_STYLES = [
  'circle' as const,
  'rect' as const,
  'triangle' as const,
  'rectRot' as const,
  'star' as const,
]

export function ChartView({ data }: ChartViewProps) {
  const { headers, rows } = data

  const firstColumnKey = headers[0]
  const locations = useMemo(() => {
    const seen = new Set<string>()
    const uniqueLocations: string[] = []

    rows.forEach(row => {
      const location = row[firstColumnKey]
      if (location && !seen.has(location)) {
        seen.add(location)
        uniqueLocations.push(location)
      }
    })

    return uniqueLocations
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

  const [selectedLocations, setSelectedLocations] = useState<string[]>(
    locations.length ? [locations[0]] : []
  )
  const [selectedVariables, setSelectedVariables] = useState<string[]>(
    variables.length ? [variables[0]] : []
  )

  useEffect(() => {
    if (locations.length > 0 && selectedLocations.length === 0) {
      setSelectedLocations([locations[0]])
    }
  }, [locations, selectedLocations.length])

  useEffect(() => {
    if (variables.length > 0 && selectedVariables.length === 0) {
      setSelectedVariables([variables[0]])
    }
  }, [variables, selectedVariables.length])

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

  const { chartLabels, datasets, variableUnits, variableScales } = useMemo(() => {
    if (selectedLocations.length === 0 || selectedVariables.length === 0) {
      return { chartLabels: [], datasets: [], variableUnits: new Map(), variableScales: new Map() }
    }

    const units = new Map<string, string>()
    const scales = new Map<string, { min: number; max: number }>()
    const labels: string[] = []
    const dataBySeriesKey = new Map<string, (number | null)[]>()

    dateColumns.forEach(dateCol => {
      labels.push(formatDateColumn(dateCol))

      selectedLocations.forEach(location => {
        const locationRow = rows.find(row => row[firstColumnKey] === location)
        if (!locationRow) return

        selectedVariables.forEach(variable => {
          const cellValue = locationRow[dateCol] || ''
          const lines = cellValue.split('\n')
          const key = `${location}__${variable}`

          if (!dataBySeriesKey.has(key)) {
            dataBySeriesKey.set(key, [])
          }

          let valueFound = false
          for (const line of lines) {
            if (line.toLowerCase().includes(variable.toLowerCase())) {
              const colonIndex = line.indexOf(':')
              if (colonIndex > 0) {
                const valueStr = line.substring(colonIndex + 1).trim()
                const numMatch = valueStr.match(/-?\d+\.?\d*/)
                if (numMatch) {
                  const value = parseFloat(numMatch[0])
                  dataBySeriesKey.get(key)!.push(value)
                  valueFound = true

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

          if (!valueFound) {
            dataBySeriesKey.get(key)!.push(null)
          }
        })
      })
    })

    const chartDatasets: any[] = selectedLocations.flatMap((location, locIdx) =>
      selectedVariables.map((variable, varIdx) => {
        const key = `${location}__${variable}`
        const color = LOCATION_COLORS[locIdx % LOCATION_COLORS.length]
        const borderDash = LINE_DASH_PATTERNS[varIdx % LINE_DASH_PATTERNS.length]
        const pointStyle = POINT_STYLES[varIdx % POINT_STYLES.length]

        return {
          label: `${location} - ${variable}`,
          data: dataBySeriesKey.get(key) || [],
          borderColor: color,
          backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.1)'),
          borderWidth: 2,
          borderDash,
          pointStyle,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.1,
          yAxisID: variable,
        }
      })
    )

    return { chartLabels: labels, datasets: chartDatasets, variableUnits: units, variableScales: scales }
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

  const chartOptions: ChartOptions<'line'> = useMemo(() => {
    const yAxes: Record<string, any> = {}

    if (needsMultipleAxes) {
      selectedVariables.forEach((variable, idx) => {
        yAxes[variable] = {
          type: 'linear' as const,
          display: true,
          position: idx % 2 === 0 ? 'left' : 'right',
          title: {
            display: true,
            text: `${variable} (${variableUnits.get(variable) || ''})`,
          },
          grid: {
            drawOnChartArea: idx === 0,
          },
        }
      })
    } else {
      yAxes['y'] = {
        type: 'linear' as const,
        display: true,
        position: 'left',
        title: {
          display: true,
          text: selectedVariables.length === 1 
            ? `${selectedVariables[0]} (${variableUnits.get(selectedVariables[0]) || ''})` 
            : 'Value',
        },
      }

      datasets.forEach(dataset => {
        dataset.yAxisID = 'y'
      })
    }

    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top' as const,
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || ''
              if (label) {
                label += ': '
              }
              if (context.parsed.y !== null) {
                const varMatch = label.match(/- (.+)$/)
                const unit = varMatch ? variableUnits.get(varMatch[1].trim()) || '' : ''
                label += context.parsed.y + ' ' + unit
              }
              return label
            }
          }
        },
      },
      scales: yAxes,
    }
  }, [needsMultipleAxes, selectedVariables, variableUnits, datasets])

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

        {selectedLocations.length > 0 && selectedVariables.length > 0 && (
          <div className="h-96">
            <Line options={chartOptions} data={{ labels: chartLabels, datasets }} />
          </div>
        )}

        {selectedLocations.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            Please select at least one location
          </p>
        )}

        {selectedVariables.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            Please select at least one variable
          </p>
        )}
      </CardContent>
    </Card>
  )
}
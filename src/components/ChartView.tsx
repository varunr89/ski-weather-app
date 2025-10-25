import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { CsvData } from '@/hooks/useCsvData'
import { formatDateColumn } from '@/lib/dataFormatters'

interface ChartViewProps {
  data: CsvData
}

export function ChartView({ data }: ChartViewProps) {
  const { headers, rows } = data

  const firstColumnKey = headers[0]
  const locations = useMemo(() => {
    return rows.map(row => row[firstColumnKey]).filter(Boolean)
  }, [rows, firstColumnKey])

  const dateColumns = useMemo(() => {
    return headers.slice(1)
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

  const [selectedLocation, setSelectedLocation] = useState<string>(locations[0] || '')
  const [selectedVariable, setSelectedVariable] = useState<string>(variables[0] || '')

  const chartData = useMemo(() => {
    if (!selectedLocation || !selectedVariable) return []

    const locationRow = rows.find(row => row[firstColumnKey] === selectedLocation)
    if (!locationRow) return []

    return dateColumns.map(dateCol => {
      const cellValue = locationRow[dateCol] || ''
      const lines = cellValue.split('\n')
      
      let value: number | null = null
      for (const line of lines) {
        if (line.toLowerCase().includes(selectedVariable.toLowerCase())) {
          const colonIndex = line.indexOf(':')
          if (colonIndex > 0) {
            const valueStr = line.substring(colonIndex + 1).trim()
            const numMatch = valueStr.match(/-?\d+\.?\d*/)
            if (numMatch) {
              value = parseFloat(numMatch[0])
              break
            }
          }
        }
      }

      return {
        date: dateCol,
        dateLabel: formatDateColumn(dateCol),
        value
      }
    }).filter(item => item.value !== null)
  }, [selectedLocation, selectedVariable, rows, dateColumns, firstColumnKey])

  const unit = useMemo(() => {
    if (!selectedVariable) return ''
    
    const sampleRow = rows[0]
    if (!sampleRow) return ''
    
    const sampleCol = dateColumns[0]
    if (!sampleCol) return ''
    
    const cellValue = sampleRow[sampleCol] || ''
    const lines = cellValue.split('\n')
    
    for (const line of lines) {
      if (line.toLowerCase().includes(selectedVariable.toLowerCase())) {
        const colonIndex = line.indexOf(':')
        if (colonIndex > 0) {
          const valueStr = line.substring(colonIndex + 1).trim()
          
          if (valueStr.includes('°F')) return '°F'
          if (valueStr.includes('°C')) return '°C'
          if (valueStr.includes('mph')) return 'mph'
          if (valueStr.includes('in')) return 'in'
          if (valueStr.includes('cm')) return 'cm'
          if (valueStr.includes('%')) return '%'
          if (valueStr.includes('ft')) return 'ft'
          if (valueStr.includes('m')) return 'm'
        }
      }
    }
    
    return ''
  }, [selectedVariable, rows, dateColumns])

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
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location-select">Location</Label>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger id="location-select">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map(location => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="variable-select">Variable</Label>
            <Select value={selectedVariable} onValueChange={setSelectedVariable}>
              <SelectTrigger id="variable-select">
                <SelectValue placeholder="Select variable" />
              </SelectTrigger>
              <SelectContent>
                {variables.map(variable => (
                  <SelectItem key={variable} value={variable}>
                    {variable}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {chartData.length > 0 ? (
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
                <YAxis
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--foreground))' }}
                  label={{ 
                    value: unit, 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fill: 'hsl(var(--foreground))' }
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                    color: 'hsl(var(--popover-foreground))'
                  }}
                  labelFormatter={(value) => formatDateColumn(value as string)}
                  formatter={(value: number) => [`${value} ${unit}`, selectedVariable]}
                />
                <Legend 
                  wrapperStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                  activeDot={{ r: 6 }}
                  name={selectedVariable}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No data available for the selected location and variable
          </div>
        )}
      </CardContent>
    </Card>
  )
}

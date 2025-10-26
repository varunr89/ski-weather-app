import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface IndexChartProps {
  data: CsvData
  type: 'skiing' | 'climbing'
}

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

export function IndexChart({ data, type }: IndexChartProps) {
  const { headers, rows } = data

  const indexName = type === 'skiing' ? 'Skiability Index' : 'Climbing Index'
  const firstColumnKey = headers[0]

  const dateColumns = useMemo(() => {
    return headers.slice(1).filter(col => !col.toLowerCase().includes('current datetime'))
  }, [headers])

  const locations = useMemo(() => {
    return rows.map(row => row[firstColumnKey]).filter(Boolean)
  }, [rows, firstColumnKey])

  const { chartLabels, datasets } = useMemo(() => {
    const labels: string[] = []
    const dataByLocation = new Map<string, (number | null)[]>()

    locations.forEach(location => {
      dataByLocation.set(location, [])
    })

    dateColumns.forEach(dateCol => {
      labels.push(formatDateColumn(dateCol))

      locations.forEach(location => {
        const locationRow = rows.find(row => row[firstColumnKey] === location)
        if (!locationRow) {
          dataByLocation.get(location)!.push(null)
          return
        }

        const cellValue = locationRow[dateCol] || ''
        const lines = cellValue.split('\n')

        let indexValue: number | null = null
        for (const line of lines) {
          if (line.toLowerCase().includes(indexName.toLowerCase())) {
            const colonIndex = line.indexOf(':')
            if (colonIndex > 0) {
              const valueStr = line.substring(colonIndex + 1).trim()
              const numMatch = valueStr.match(/-?\d+\.?\d*/)
              if (numMatch) {
                indexValue = parseFloat(numMatch[0])
                break
              }
            }
          }
        }

        dataByLocation.get(location)!.push(indexValue)
      })
    })

    const chartDatasets = locations.map((location, idx) => {
      const color = LOCATION_COLORS[idx % LOCATION_COLORS.length]

      return {
        label: location,
        data: dataByLocation.get(location) || [],
        borderColor: color,
        backgroundColor: color.replace('rgb', 'rgba').replace(')', ', 0.3)'),
        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
        tension: 0.3,
      }
    })

    return { chartLabels: labels, datasets: chartDatasets }
  }, [locations, rows, dateColumns, firstColumnKey, indexName])

  const chartOptions: ChartOptions<'line'> = useMemo(() => {
    const redZonePlugin = {
      id: 'redZone',
      beforeDraw: (chart: any) => {
        const ctx = chart.ctx
        const chartArea = chart.chartArea
        const yScale = chart.scales.y

        const greenTop = yScale.getPixelForValue(100)
        const greenBottom = yScale.getPixelForValue(66)
        const yellowTop = yScale.getPixelForValue(66)
        const yellowBottom = yScale.getPixelForValue(33)
        const redTop = yScale.getPixelForValue(33)
        const redBottom = yScale.getPixelForValue(0)

        ctx.save()

        ctx.fillStyle = 'rgba(134, 239, 172, 0.2)'
        ctx.fillRect(
          chartArea.left,
          greenTop,
          chartArea.right - chartArea.left,
          greenBottom - greenTop
        )

        ctx.fillStyle = 'rgba(253, 224, 71, 0.2)'
        ctx.fillRect(
          chartArea.left,
          yellowTop,
          chartArea.right - chartArea.left,
          yellowBottom - yellowTop
        )

        ctx.fillStyle = 'rgba(252, 165, 165, 0.2)'
        ctx.fillRect(
          chartArea.left,
          redTop,
          chartArea.right - chartArea.left,
          redBottom - redTop
        )

        ctx.restore()
      }
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
                label += context.parsed.y.toFixed(1)
                if (context.parsed.y >= 66) {
                  label += ' (Good)'
                } else if (context.parsed.y >= 33) {
                  label += ' (Fair)'
                } else {
                  label += ' (Poor)'
                }
              }
              return label
            }
          }
        },
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: {
            callback: function(value) {
              if (value === 100 || value === 66) return 'Good'
              if (value === 33) return 'Fair'
              if (value === 0) return 'Poor'
              return ''
            }
          },
          grid: {
            color: (context) => {
              const value = context.tick.value
              if (value === 66 || value === 33) {
                return 'rgba(0, 0, 0, 0.3)'
              }
              return 'rgba(0, 0, 0, 0.1)'
            },
            lineWidth: (context) => {
              const value = context.tick.value
              if (value === 66 || value === 33) {
                return 2
              }
              return 1
            }
          }
        },
        x: {
          title: {
            display: true,
            text: 'Date'
          }
        }
      },
    }
  }, [])

  if (chartLabels.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardContent className="py-8 text-center text-muted-foreground">
          No index data available
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>{indexName} Over Time</CardTitle>
        {data.timestamp && (
          <p className="text-sm text-muted-foreground mt-2">
            {data.timestamp}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="w-full h-[400px]">
          <Line 
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                beforeDraw: [{
                  id: 'customBackground',
                  beforeDraw: (chart: any) => {
                    const ctx = chart.ctx
                    const chartArea = chart.chartArea
                    const yScale = chart.scales.y

                    const greenTop = yScale.getPixelForValue(100)
                    const greenBottom = yScale.getPixelForValue(66)
                    const yellowTop = yScale.getPixelForValue(66)
                    const yellowBottom = yScale.getPixelForValue(33)
                    const redTop = yScale.getPixelForValue(33)
                    const redBottom = yScale.getPixelForValue(0)

                    ctx.save()

                    ctx.fillStyle = 'rgba(134, 239, 172, 0.2)'
                    ctx.fillRect(
                      chartArea.left,
                      greenTop,
                      chartArea.right - chartArea.left,
                      greenBottom - greenTop
                    )

                    ctx.fillStyle = 'rgba(253, 224, 71, 0.2)'
                    ctx.fillRect(
                      chartArea.left,
                      yellowTop,
                      chartArea.right - chartArea.left,
                      yellowBottom - yellowTop
                    )

                    ctx.fillStyle = 'rgba(252, 165, 165, 0.2)'
                    ctx.fillRect(
                      chartArea.left,
                      redTop,
                      chartArea.right - chartArea.left,
                      redBottom - redTop
                    )

                    ctx.restore()
                  }
                }]
              }
            } as any}
            data={{ labels: chartLabels, datasets } as any} 
            plugins={[{
              id: 'customBackground',
              beforeDraw: (chart: any) => {
                const ctx = chart.ctx
                const chartArea = chart.chartArea
                const yScale = chart.scales.y

                const greenTop = yScale.getPixelForValue(100)
                const greenBottom = yScale.getPixelForValue(66)
                const yellowTop = yScale.getPixelForValue(66)
                const yellowBottom = yScale.getPixelForValue(33)
                const redTop = yScale.getPixelForValue(33)
                const redBottom = yScale.getPixelForValue(0)

                ctx.save()

                ctx.fillStyle = 'rgba(134, 239, 172, 0.2)'
                ctx.fillRect(
                  chartArea.left,
                  greenTop,
                  chartArea.right - chartArea.left,
                  greenBottom - greenTop
                )

                ctx.fillStyle = 'rgba(253, 224, 71, 0.2)'
                ctx.fillRect(
                  chartArea.left,
                  yellowTop,
                  chartArea.right - chartArea.left,
                  yellowBottom - yellowTop
                )

                ctx.fillStyle = 'rgba(252, 165, 165, 0.2)'
                ctx.fillRect(
                  chartArea.left,
                  redTop,
                  chartArea.right - chartArea.left,
                  redBottom - redTop
                )

                ctx.restore()
              }
            }]}
          />
        </div>
      </CardContent>
    </Card>
  )
}

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ColorLegendProps {
  type: 'skiing' | 'climbing'
}

export function ColorLegend({ type }: ColorLegendProps) {
  const title = type === 'skiing' ? 'Skiability Index' : 'Climbing Index'
  
  const legendItems = [
    {
      color: 'green',
      label: 'Good',
      description: 'Excellent conditions for activity'
    },
    {
      color: 'yellow',
      label: 'Fair',
      description: 'Moderate conditions, use caution'
    },
    {
      color: 'red',
      label: 'Poor',
      description: 'Challenging or unsafe conditions'
    }
  ]

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-lg">{title} Legend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {legendItems.map((item) => (
            <div key={item.color} className="flex items-center gap-3">
              <Badge
                className={`min-w-20 justify-center ${
                  item.color === 'green'
                    ? 'bg-index-green text-foreground'
                    : item.color === 'yellow'
                    ? 'bg-index-yellow text-foreground'
                    : 'bg-index-red text-foreground'
                }`}
              >
                {item.label}
              </Badge>
              <span className="text-sm text-muted-foreground">{item.description}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

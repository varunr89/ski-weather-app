import { ArrowClockwise, Warning } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { UseCsvDataResult } from '@/hooks/useCsvData'
import { DataTable } from './DataTable'
import { ColorLegend } from './ColorLegend'

interface DataSectionProps {
  id: string
  title: string
  csvResult: UseCsvDataResult
  noaaResult?: UseCsvDataResult
  type: 'skiing' | 'climbing'
}

export function DataSection({ id, title, csvResult, noaaResult, type }: DataSectionProps) {
  const { data, loading, error, refetch } = csvResult

  if (loading) {
    return (
      <section id={id} className="py-12 px-6 scroll-mt-4">
        <div className="container mx-auto max-w-7xl">
          <Card className="shadow-lg">
            <CardHeader>
              <Skeleton className="h-8 w-64" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id={id} className="py-12 px-6 scroll-mt-4">
        <div className="container mx-auto max-w-7xl">
          <Card className="shadow-lg border-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <Warning size={24} weight="fill" />
                Error Loading {title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button onClick={refetch} variant="outline" className="gap-2">
                <ArrowClockwise size={16} />
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  return (
    <section id={id} className="py-12 px-6 scroll-mt-4">
      <div className="container mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
            {title}
          </h2>
          
          <ColorLegend type={type} />
        </div>

        {data && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Forecast Data</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                headers={data.headers}
                rows={data.rows}
                timestamp={data.timestamp}
              />
            </CardContent>
          </Card>
        )}

        {noaaResult && !noaaResult.loading && !noaaResult.error && noaaResult.data && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>NOAA Supplemental Data</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                headers={noaaResult.data.headers}
                rows={noaaResult.data.rows}
                timestamp={noaaResult.data.timestamp}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  )
}

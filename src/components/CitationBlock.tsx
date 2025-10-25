import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useCitationText } from '@/hooks/useCitationText'

export function CitationBlock() {
  const { text, loading, error } = useCitationText(
    'https://raw.githubusercontent.com/open-meteo/open-meteo/main/CITATION.cff'
  )

  if (loading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Data Attribution</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="shadow-lg border-destructive">
        <CardHeader>
          <CardTitle>Data Attribution</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">Failed to load citation: {error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Data Attribution</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="text-xs font-mono bg-muted p-4 rounded-md overflow-auto max-h-96 whitespace-pre-wrap break-words">
          {text}
        </pre>
      </CardContent>
    </Card>
  )
}

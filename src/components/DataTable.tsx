import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatDateColumn, parseIndexColor, truncateText } from '@/lib/dataFormatters'

interface DataTableProps {
  headers: string[]
  rows: Record<string, string>[]
  timestamp?: string
}

export function DataTable({ headers, rows, timestamp }: DataTableProps) {
  const [selectedCell, setSelectedCell] = useState<{ content: string; header: string } | null>(null)

  if (rows.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No data available
      </div>
    )
  }

  const firstColumnKey = headers[0]
  const dataColumns = headers.slice(1)

  const getCellBackgroundClass = (value: string) => {
    const indexColor = parseIndexColor(value)
    if (!indexColor) return ''
    
    switch (indexColor) {
      case 'green':
        return 'bg-index-green'
      case 'yellow':
        return 'bg-index-yellow'
      case 'red':
        return 'bg-index-red'
      default:
        return ''
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="overflow-auto border rounded-lg shadow-sm">
          <div className="inline-block min-w-full align-middle">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50 sticky top-0 z-10">
                <tr>
                  <th
                    scope="col"
                    className="sticky left-0 z-20 bg-muted/50 px-4 py-3 text-left text-sm font-semibold text-foreground border-r border-border"
                  >
                    {formatDateColumn(firstColumnKey)}
                  </th>
                  {dataColumns.map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className="px-4 py-3 text-left text-sm font-semibold text-foreground whitespace-nowrap"
                    >
                      {formatDateColumn(header)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-muted/30 transition-colors">
                    <td className="sticky left-0 z-10 bg-card px-4 py-3 text-sm font-medium text-foreground border-r border-border whitespace-nowrap">
                      {row[firstColumnKey]}
                    </td>
                    {dataColumns.map((header) => {
                      const value = row[header] || ''
                      const { text, isTruncated } = truncateText(value)
                      const bgClass = getCellBackgroundClass(value)
                      
                      return (
                        <td
                          key={header}
                          className={`px-4 py-3 text-sm text-foreground ${bgClass} ${
                            isTruncated ? 'cursor-pointer hover:underline' : ''
                          }`}
                          onClick={() => {
                            if (isTruncated) {
                              setSelectedCell({ content: value, header })
                            }
                          }}
                        >
                          {text}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedCell} onOpenChange={(open) => !open && setSelectedCell(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{selectedCell?.header}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 text-sm whitespace-pre-wrap">
            {selectedCell?.content}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

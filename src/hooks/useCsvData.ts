import { useState, useEffect } from 'react'
import Papa from 'papaparse'

export interface CsvData {
  headers: string[]
  rows: Record<string, string>[]
  timestamp?: string
}

export interface UseCsvDataResult {
  data: CsvData | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useCsvData(url: string, timestampField = 'Current DateTime [PST]'): UseCsvDataResult {
  const [data, setData] = useState<CsvData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const text = await response.text()
        
        const lines = text.split('\n')
        let forecastTimestamp: string | undefined
        let headerLineIndex = 0
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim()
          
          if (line.match(/Forecast current as of.*PST/i)) {
            const match = line.match(/Forecast current as of (.+)/i)
            if (match) {
              forecastTimestamp = match[1].trim()
            }
          }
          
          if (line.toLowerCase().includes('resort') || line.toLowerCase().includes('location')) {
            headerLineIndex = i
            break
          }
        }
        
        const cleanedCsv = lines.slice(headerLineIndex).join('\n')

        Papa.parse(cleanedCsv, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              const errorMessages = results.errors.map(e => e.message).join(', ')
              setError(`CSV parsing errors: ${errorMessages}`)
              return
            }

            const allHeaders = results.meta.fields || []
            const allRows = results.data as Record<string, string>[]
            
            const filteredHeaders = allHeaders.slice(1)
            const filteredRows = allRows.map(row => {
              const newRow: Record<string, string> = {}
              filteredHeaders.forEach(header => {
                newRow[header] = row[header]
              })
              return newRow
            })

            setData({
              headers: filteredHeaders,
              rows: filteredRows,
              timestamp: forecastTimestamp
            })
            setLoading(false)
          },
          error: (error) => {
            setError(`CSV parsing failed: ${error.message}`)
            setLoading(false)
          }
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch CSV')
        setLoading(false)
      }
    }

    fetchData()
  }, [url, timestampField, refetchTrigger])

  const refetch = () => {
    setRefetchTrigger(prev => prev + 1)
  }

  return { data, loading, error, refetch }
}

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

        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              const errorMessages = results.errors.map(e => e.message).join(', ')
              setError(`CSV parsing errors: ${errorMessages}`)
              return
            }

            const rows = results.data as Record<string, string>[]
            const headers = results.meta.fields || []
            const timestamp = rows[0]?.[timestampField]

            setData({
              headers,
              rows,
              timestamp
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

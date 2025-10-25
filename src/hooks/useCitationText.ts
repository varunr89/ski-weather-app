import { useState, useEffect } from 'react'

export function useCitationText(url: string) {
  const [text, setText] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCitation = async () => {
      try {
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const content = await response.text()
        setText(content)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch citation')
        setLoading(false)
      }
    }

    fetchCitation()
  }, [url])

  return { text, loading, error }
}

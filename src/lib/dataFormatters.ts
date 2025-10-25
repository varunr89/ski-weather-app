export function formatDateColumn(columnName: string): string {
  const dateMatch = columnName.match(/^(\d{4}-\d{2}-\d{2})$/)
  if (!dateMatch) return columnName

  try {
    const date = new Date(dateMatch[1] + 'T00:00:00')
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
    return `${dateMatch[1]} (${dayName})`
  } catch {
    return columnName
  }
}

export function parseIndexColor(value: string): 'green' | 'yellow' | 'red' | null {
  const lowerValue = value.toLowerCase()
  
  if (lowerValue.includes('index:green') || lowerValue.includes('index: green')) {
    return 'green'
  }
  if (lowerValue.includes('index:yellow') || lowerValue.includes('index: yellow')) {
    return 'yellow'
  }
  if (lowerValue.includes('index:red') || lowerValue.includes('index: red')) {
    return 'red'
  }
  
  return null
}

export function truncateText(text: string, maxLength = 80): { text: string; isTruncated: boolean } {
  if (text.length <= maxLength) {
    return { text, isTruncated: false }
  }
  
  return {
    text: text.substring(0, maxLength) + '...',
    isTruncated: true
  }
}

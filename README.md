# Ski Weather - Mountain Sports Forecasts

A modern, responsive single-page application that displays real-time weather forecasts and activity indices for ski resorts and climbing locations. Built with React 18, TypeScript, and Vite.

## Features

- **Real-time CSV Data Fetching**: Loads ski resort and climbing location forecast data from remote CSV sources
- **Responsive Data Tables**: Scrollable tables with sticky headers and first columns for easy navigation
- **Color-Coded Indices**: Visual tinting (green/yellow/red) for skiability and climbing condition indices
- **Smart Text Truncation**: Long cell content is truncated with modal expansion for full text
- **Timestamp Display**: Shows forecast currency with PST timestamps
- **Data Attribution**: Displays Open-Meteo citation information
- **Modern UI**: Gradient hero header, card-based layout, smooth animations, and accessibility features
- **Mobile Optimized**: Touch-friendly with responsive layouts and smooth scrolling

## Data Sources

The application fetches data from the following endpoints:

1. **Ski Resorts**: `https://skiweather2.blob.core.windows.net/meteomaticsdata/data_openmeteo.csv`
2. **NOAA Supplemental**: `https://skiweather2.blob.core.windows.net/meteomaticsdata/skidata_noaa.csv`
3. **Climbing Locations**: `https://skiweather2.blob.core.windows.net/meteomaticsdata/data_climbing.csv`
4. **Citation**: `https://raw.githubusercontent.com/open-meteo/open-meteo/main/CITATION.cff`

## Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **CSV Parsing**: Papa Parse
- **Icons**: Phosphor Icons
- **Fonts**: Inter (UI) + Fira Code (monospace)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd spark-template
```

2. Install dependencies:
```bash
npm install
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

### Build

Create a production build:
```bash
npm run build
```

### Preview

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── CitationBlock.tsx      # Attribution display
│   ├── ColorLegend.tsx        # Color index legend
│   ├── DataSection.tsx        # Section wrapper with loading/error states
│   ├── DataTable.tsx          # Responsive table with sticky headers
│   └── HeroHeader.tsx         # Hero banner with navigation
├── hooks/
│   ├── useCitationText.ts     # Fetch citation text
│   ├── useCsvData.ts          # CSV data fetching hook
│   └── use-mobile.ts          # Mobile detection utility
├── lib/
│   ├── dataFormatters.ts      # Date formatting, index parsing, truncation
│   └── utils.ts               # Class name utilities
├── App.tsx                    # Main application component
├── index.css                  # Global styles and theme
└── main.tsx                   # Application entry point
```

## Key Features Explained

### CSV Data Fetching

The `useCsvData` hook fetches and parses CSV files using Papa Parse:

```typescript
const skiResortData = useCsvData(SKI_RESORT_CSV)
```

It provides:
- `data`: Parsed CSV with headers and rows
- `loading`: Loading state
- `error`: Error message if fetch fails
- `refetch`: Function to retry fetching

### Color-Coded Cells

Cells containing "Skiability index:green" or "Climbing index:red" are automatically detected and tinted with the appropriate background color while maintaining text readability (WCAG AA compliant).

### Responsive Tables

Tables use CSS `position: sticky` for headers and first columns, ensuring context is maintained while scrolling both horizontally and vertically.

### Date Formatting

Date columns in YYYY-MM-DD format are automatically enhanced to show the day of the week:
- `2024-10-22` → `2024-10-22 (Tuesday)`

### Text Truncation

Cell content longer than 80 characters is truncated with "..." and becomes clickable to open a modal showing the full text.

## Customization

### Theme Colors

Colors are defined in `src/index.css` using CSS custom properties:

```css
:root {
  --primary: oklch(0.45 0.12 240);    /* Deep Ocean Blue */
  --secondary: oklch(0.65 0.08 200);  /* Soft Teal */
  --accent: oklch(0.70 0.15 210);     /* Vibrant Cyan */
  --index-green: oklch(0.85 0.10 145);
  --index-yellow: oklch(0.90 0.12 95);
  --index-red: oklch(0.85 0.12 25);
}
```

### Fonts

Fonts are loaded via Google Fonts in `index.html`:
- Inter: UI and body text
- Fira Code: Monospace for citation block

## Accessibility

The application follows accessibility best practices:

- Semantic HTML landmarks (`<header>`, `<main>`, `<section>`, `<footer>`)
- WCAG AA contrast ratios for all text
- Keyboard navigation support
- Screen reader friendly table headers with `scope` attributes
- Touch-friendly tap targets (minimum 44px)
- Smooth scroll behavior with reduced motion support

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

See LICENSE file for details.

## Attribution

Weather data provided by [Open-Meteo](https://open-meteo.com/) and NOAA. Please see the in-app citation block for full attribution details.

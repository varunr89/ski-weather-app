# Planning Guide

A comprehensive data visualization application that displays weather-dependent activity forecasts for ski resorts and climbing locations, fetching and presenting real-time CSV data in an accessible, visually organized format.

**Experience Qualities**:
1. **Data-Driven**: Visual charts with interactive filters prioritize trend analysis while maintaining access to detailed tabular data through collapsible sections
2. **Responsive**: Seamlessly adapts from mobile to desktop with responsive charts, smooth scrolling, and accessible navigation
3. **Professional**: Academic/scientific aesthetic with proper attribution, clear timestamps, and reliable data fetching

**Complexity Level**: Light Application (multiple features with basic state)
- Fetches external CSV data sources at runtime
- Manages loading/error states across multiple datasets
- Implements interactive UI patterns (modals, tooltips, smooth scrolling)
- Provides data formatting and color-coded visualization

## Essential Features

### CSV Data Fetching
- **Functionality**: Fetch and parse four remote CSV files using Papa Parse library
- **Purpose**: Display real-time weather and activity forecast data without hardcoding
- **Trigger**: On initial app mount
- **Progression**: App loads → Show loading states → Fetch CSVs in parallel → Parse to objects → Display in tables (or show error states)
- **Success criteria**: All four CSV sources load successfully, parse correctly, and populate their respective sections

### Interactive Chart Visualization
- **Functionality**: Display forecast data as line charts with location and variable filters
- **Purpose**: Provide intuitive visual representation of trends over time for specific locations and metrics
- **Trigger**: After successful CSV data fetch
- **Progression**: Data loaded → Extract locations and variables → Render chart with default selection → User changes location/variable → Chart updates with filtered data → X-axis shows dates, Y-axis shows numerical values
- **Success criteria**: Charts render smoothly, filters update instantly, trends are clearly visible, axes are properly labeled with units

### Responsive Data Tables (Accordion)
- **Functionality**: Display full tabular data in collapsible accordion for reference
- **Purpose**: Provide detailed view for users who need comprehensive data access while keeping primary view clean
- **Trigger**: User expands accordion item
- **Progression**: Chart visible by default → User clicks "View Table Data" → Accordion expands → Table renders with sticky headers → User can view all raw data
- **Success criteria**: Tables expand smoothly, headers remain sticky, accordion state persists during interaction

### Color-Coded Index Cells
- **Functionality**: Parse "Skiability index:green" or "Climbing index:red" text and apply background tints
- **Purpose**: Provide immediate visual feedback about conditions without requiring text reading
- **Trigger**: Cell contains "index:" pattern
- **Progression**: Cell renders → Parse index color → Apply appropriate background tint (green/yellow/red) → Display full text
- **Success criteria**: All index cells show correct color tinting, text remains readable with sufficient contrast

### Text Truncation with Full View
- **Functionality**: Limit cell text to ~80 characters with modal/tooltip to view complete content
- **Purpose**: Maintain table layout while allowing access to full data when needed
- **Trigger**: Cell text exceeds 80 characters
- **Progression**: Long text detected → Display first 80 chars + "..." → User clicks/hovers → Modal/tooltip shows full text → User closes to return
- **Success criteria**: Long text doesn't break layout, full text is accessible, interaction is intuitive

### Current Forecast Timestamp
- **Functionality**: Extract and display "Current DateTime [PST]" from first row of each dataset
- **Purpose**: Communicate data freshness and build trust in information accuracy
- **Trigger**: Data successfully parsed
- **Progression**: Parse first row → Extract timestamp field → Display as "Forecast current as of [timestamp] PST" above each table
- **Success criteria**: Timestamp displays correctly for both sections, updates when data refreshes

### Attribution Block
- **Functionality**: Fetch and display CITATION.cff content in monospace card
- **Purpose**: Provide proper academic attribution for data sources
- **Trigger**: On app mount
- **Progression**: App loads → Fetch citation text → Display in dedicated card with monospace font → Style as distinct citation block
- **Success criteria**: Citation text loads, displays in monospace, remains visible throughout session

### Section Navigation
- **Functionality**: Hero header with anchor links to Skiing and Climbing sections
- **Purpose**: Enable quick navigation within the single-page application
- **Trigger**: User clicks navigation link
- **Progression**: User clicks "Skiing" or "Climbing" → Smooth scroll to section → Section becomes visible
- **Success criteria**: Smooth scrolling works, links are clearly visible, sections are properly targeted

### Color Legend Cards
- **Functionality**: Display legend explaining green/yellow/red color meanings for both activities
- **Purpose**: Help users interpret color-coded index cells without guesswork
- **Trigger**: Always visible within each section
- **Progression**: Section renders → Legend card appears → Shows color swatches with descriptions
- **Success criteria**: Legends match actual color tinting, descriptions are clear and concise

## Edge Case Handling

- **CSV Fetch Failures**: Display friendly error message with retry button, log error details for debugging
- **Malformed CSV Data**: Show parsing error, attempt to display partial data if possible
- **Missing Index Color**: Display cell without tinting if color pattern doesn't match green/yellow/red
- **Empty Datasets**: Show "No data available" message instead of empty tables
- **Very Long Cell Content**: Modal with scrollable content area, copy-to-clipboard button
- **Network Timeouts**: Implement reasonable timeout limits, show timeout-specific error message
- **Mobile Landscape**: Optimize table scrolling for landscape orientation, ensure touch interactions work smoothly
- **Missing Timestamp Field**: Display generic "Forecast data" header if timestamp field not found

## Design Direction

The design should feel professional, data-focused, and analytical—like a scientific or meteorological dashboard enhanced with modern data visualization. Think clean weather analytics platforms or research data portals: crisp typography, ample whitespace, interactive charts with intuitive controls, and purposeful color usage that enhances data comprehension. Minimal interface that lets visualizations be the primary focus while maintaining sophistication through elegant spacing, soft shadows, and smooth transitions.

## Color Selection

Analogous color scheme (adjacent colors on color wheel) centered around cool blues and teals to evoke winter weather, mountains, and reliability. This creates a cohesive, calming palette while reserving high-contrast accent colors for the data visualization (green/yellow/red index indicators).

- **Primary Color**: Deep Ocean Blue `oklch(0.45 0.12 240)` - Professional, trustworthy, evokes winter sports and mountain weather
- **Secondary Colors**: 
  - Soft Teal `oklch(0.65 0.08 200)` for subtle cards and backgrounds
  - Light Sky `oklch(0.90 0.03 220)` for hover states and highlights
- **Accent Color**: Vibrant Cyan `oklch(0.70 0.15 210)` for interactive elements and CTAs
- **Foreground/Background Pairings**:
  - Background (White `oklch(0.99 0 0)`): Foreground Dark Gray `oklch(0.25 0 0)` - Ratio 12.8:1 ✓
  - Card (Soft Sky `oklch(0.96 0.01 220)`): Foreground Dark Gray `oklch(0.25 0 0)` - Ratio 11.2:1 ✓
  - Primary (Deep Ocean `oklch(0.45 0.12 240)`): White text `oklch(0.99 0 0)` - Ratio 7.1:1 ✓
  - Accent (Vibrant Cyan `oklch(0.70 0.15 210)`): Dark text `oklch(0.20 0 0)` - Ratio 10.5:1 ✓
  - Muted (Light Gray `oklch(0.85 0 0)`): Medium Gray text `oklch(0.45 0 0)` - Ratio 4.8:1 ✓
  - Green Index `oklch(0.85 0.10 145)`: Dark text `oklch(0.25 0 0)` - Ratio 9.8:1 ✓
  - Yellow Index `oklch(0.90 0.12 95)`: Dark text `oklch(0.25 0 0)` - Ratio 11.5:1 ✓
  - Red Index `oklch(0.85 0.12 25)`: Dark text `oklch(0.25 0 0)` - Ratio 8.9:1 ✓

## Font Selection

Typography should convey clarity and scientific precision while remaining approachable. Use clean sans-serif for UI and data, monospace for technical content like citations.

- **Primary Font**: Inter - Modern geometric sans-serif with excellent readability at all sizes, designed for UI and data display
- **Monospace Font**: Fira Code - Clear, professional monospace for citation and technical content

- **Typographic Hierarchy**:
  - H1 (Hero Title): Inter Bold/48px/tight tracking/-0.02em
  - H2 (Section Headings): Inter SemiBold/32px/tight tracking/-0.01em
  - H3 (Card Titles): Inter SemiBold/20px/normal tracking
  - Body (Table Data): Inter Regular/14px/relaxed leading/1.6
  - Small (Timestamps): Inter Medium/12px/normal tracking
  - Monospace (Citation): Fira Code Regular/13px/normal leading/1.5

## Animations

Animations should be purposeful and subtle, enhancing perceived performance during data loading and providing smooth feedback for interactions without calling attention to themselves. The overall feel should be responsive and fluid, reflecting the dynamic nature of weather data.

- **Purposeful Meaning**: Loading spinners communicate active data fetching; smooth scrolling reinforces spatial relationships between sections; fade-ins make content appearance feel polished; hover states provide immediate feedback
- **Hierarchy of Movement**: Data loading (essential) → Section navigation (wayfinding) → Hover/interaction feedback (polish) → Modal/tooltip transitions (contextual)

## Component Selection

- **Components**: 
  - **Card**: Primary container for charts, tables, legends, and citation block with subtle shadows
  - **Select**: Dropdown filters for location and variable selection
  - **Accordion**: Collapsible container for table data
  - **LineChart (Recharts)**: Primary data visualization component with responsive container
  - **ScrollArea**: Enables smooth horizontal/vertical scrolling for data tables
  - **Dialog**: Shows full text for truncated cells
  - **Skeleton**: Loading placeholders during CSV fetch
  - **Button**: Navigation links, retry actions, and interactive elements
  - **Separator**: Visual dividers between sections
  - **Label**: Form labels for filter controls
  - Tailwind modifications: Custom gradient backgrounds for hero header, adjusted card padding for data density, custom color classes for index cell tinting

- **Customizations**: 
  - Sticky table headers and first column (custom CSS with position: sticky)
  - Color-tinted table cells (custom background classes)
  - Smooth scroll behavior (CSS scroll-behavior + framer-motion for anchor links)
  - Monospace citation card (custom typography classes)

- **States**: 
  - **Buttons**: Default (primary blue) → Hover (lighter blue with lift) → Active (pressed with shadow reduction) → Disabled (muted gray with reduced opacity)
  - **Selects**: Default (border visible) → Focus (ring highlight) → Open (dropdown visible) → Selected (highlighted option)
  - **Accordion**: Closed (chevron down) → Open (chevron up, content visible) → Hover (subtle highlight)
  - **Table Cells**: Default (white) → Hover (subtle highlight) → Clickable long text (cursor pointer + underline on hover)
  - **Chart Lines**: Default (smooth path) → Hover (tooltip visible, dot enlarged) → Active (dot highlighted)
  - **Links**: Default (accent cyan) → Hover (darker cyan + underline) → Visited (slightly muted)
  - **Loading**: Skeleton shimmer animation while fetching data

- **Icon Selection**: 
  - Navigation (ArrowDown from Phosphor) for smooth scroll indicators
  - Refresh (ArrowClockwise) for retry buttons on errors
  - Info (Info) for tooltips/help text
  - Warning (Warning) for error states
  - Chevron (in Accordion) for expand/collapse indicators

- **Spacing**: Consistent 4/8/16/24/32px scale using Tailwind classes (gap-2, gap-4, gap-6, etc.), generous padding in cards (p-6 to p-8), comfortable line-height for data readability

- **Mobile**: 
  - Hero title scales down (text-3xl → text-5xl responsive)
  - Charts remain responsive and readable on mobile screens
  - Filter selects stack vertically on mobile
  - Accordion works smoothly with touch gestures
  - Tables enable horizontal scroll when accordion is expanded
  - Navigation links stack vertically on mobile
  - Cards maintain full width on mobile with adjusted padding
  - Touch-friendly tap targets (min 44px height)
  - Chart tooltips work with touch interactions

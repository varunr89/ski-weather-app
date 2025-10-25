import { useCsvData } from '@/hooks/useCsvData'
import { HeroHeader } from '@/components/HeroHeader'
import { DataSection } from '@/components/DataSection'
import { CitationBlock } from '@/components/CitationBlock'
import { Separator } from '@/components/ui/separator'

const SKI_RESORT_CSV = 'https://skiweather2.blob.core.windows.net/meteomaticsdata/data_openmeteo.csv'
const NOAA_CSV = 'https://skiweather2.blob.core.windows.net/meteomaticsdata/skidata_noaa.csv'
const CLIMBING_CSV = 'https://skiweather2.blob.core.windows.net/meteomaticsdata/data_climbing.csv'

function App() {
  const skiResortData = useCsvData(SKI_RESORT_CSV)
  const noaaData = useCsvData(NOAA_CSV)
  const climbingData = useCsvData(CLIMBING_CSV)

  const scrollToSection = (section: 'skiing' | 'climbing') => {
    const element = document.getElementById(section)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <HeroHeader onNavigate={scrollToSection} />
      
      <main className="space-y-8">
        <DataSection
          id="skiing"
          title="Ski Resort Forecasts"
          csvResult={skiResortData}
          noaaResult={noaaData}
          type="skiing"
        />
        
        <Separator className="container mx-auto max-w-7xl" />
        
        <DataSection
          id="climbing"
          title="Climbing Location Forecasts"
          csvResult={climbingData}
          type="climbing"
        />
        
        <Separator className="container mx-auto max-w-7xl" />
        
        <section className="py-12 px-6">
          <div className="container mx-auto max-w-7xl">
            <CitationBlock />
          </div>
        </section>
      </main>
      
      <footer className="py-8 px-6 bg-muted/30 mt-16">
        <div className="container mx-auto max-w-7xl text-center text-sm text-muted-foreground">
          <p>Ski Weather - Mountain Sports Forecasts</p>
          <p className="mt-2">Data provided by Open-Meteo and NOAA</p>
        </div>
      </footer>
    </div>
  )
}

export default App
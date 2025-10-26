import { ArrowDown } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

interface HeroHeaderProps {
  onNavigate: (section: 'skiing' | 'climbing') => void
}

export function HeroHeader({ onNavigate }: HeroHeaderProps) {
  return (
    <header className="relative overflow-hidden py-24 px-6">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Mount_Baker_from_Bellingham_Bay.jpg/1920px-Mount_Baker_from_Bellingham_Bay.jpg)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="flex flex-col items-center text-center gap-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight drop-shadow-lg">
            Conditions for Skiing and Climbing near Bellingham, Washington
          </h1>
          <nav className="flex flex-wrap gap-4 justify-center mt-4">
            <Button
              onClick={() => onNavigate('skiing')}
              variant="secondary"
              size="lg"
              className="gap-2 shadow-xl"
            >
              Skiing Forecasts
              <ArrowDown weight="bold" />
            </Button>
            <Button
              onClick={() => onNavigate('climbing')}
              variant="secondary"
              size="lg"
              className="gap-2 shadow-xl"
            >
              Climbing Forecasts
              <ArrowDown weight="bold" />
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}

import { ArrowDown } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'

interface HeroHeaderProps {
  onNavigate: (section: 'skiing' | 'climbing') => void
}

export function HeroHeader({ onNavigate }: HeroHeaderProps) {
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-accent py-16 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center gap-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground tracking-tight">
            Conditions for Skiing and Climbing near Bellingham, Washington
          </h1>
          <nav className="flex flex-wrap gap-4 justify-center mt-4">
            <Button
              onClick={() => onNavigate('skiing')}
              variant="secondary"
              size="lg"
              className="gap-2"
            >
              Skiing Forecasts
              <ArrowDown weight="bold" />
            </Button>
            <Button
              onClick={() => onNavigate('climbing')}
              variant="secondary"
              size="lg"
              className="gap-2"
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

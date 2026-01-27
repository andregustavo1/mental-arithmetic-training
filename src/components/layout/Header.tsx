import { Settings, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
interface HeaderProps {
  onSettingsClick: () => void;
  showSettings: boolean;
  allTimeBestStreak: number;
  allTimeBestOpm: number;
}
export function Header({
  onSettingsClick,
  showSettings,
  allTimeBestStreak,
  allTimeBestOpm
}: HeaderProps) {
  return <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          
          <h1 className="text-2xl font-bold text-highlight tracking-tight">
            math<span className="text-primary">type</span>
          </h1>
        </div>

        <div className="flex items-center gap-6">
          {/* All-time stats */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-ghost" />
              <span className="text-ghost">melhor streak:</span>
              <span className="text-highlight font-bold">{allTimeBestStreak}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-ghost">melhor opm:</span>
              <span className="text-highlight font-bold">{Math.round(allTimeBestOpm)}</span>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={onSettingsClick} className={showSettings ? 'text-primary' : 'text-muted-foreground hover:text-highlight'}>
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>;
}
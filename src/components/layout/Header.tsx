import { Settings } from 'lucide-react';
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
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-highlight tracking-tight">
          math<span className="text-primary">type</span>
        </h1>

        <div className="flex items-center gap-8">
          <div className="flex flex-col items-center">
            <span className="text-xs text-ghost uppercase tracking-wide">Melhor Streak</span>
            <span className="text-lg text-highlight font-bold">{allTimeBestStreak}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-ghost uppercase tracking-wide">Melhor OPM</span>
            <span className="text-lg text-highlight font-bold">{Math.round(allTimeBestOpm)}</span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onSettingsClick}
          className={showSettings ? 'text-primary' : 'text-muted-foreground hover:text-highlight'}
        >
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
}
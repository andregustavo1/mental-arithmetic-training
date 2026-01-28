import { Settings, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
interface HeaderProps {
  onSettingsClick: () => void;
  onHistoryClick: () => void;
  showSettings: boolean;
  showHistory: boolean;
}
export function Header({
  onSettingsClick,
  onHistoryClick,
  showSettings,
  showHistory
}: HeaderProps) {
  return <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          
          <h1 className="text-2xl font-bold text-highlight tracking-tight">
            math<span className="text-primary">type</span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onHistoryClick} className={showHistory ? 'text-primary' : 'text-muted-foreground hover:text-highlight'}>
            <BarChart3 className="w-5 h-5" />
          </Button>

          <Button variant="ghost" size="icon" onClick={onSettingsClick} className={showSettings ? 'text-primary' : 'text-muted-foreground hover:text-highlight'}>
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>;
}
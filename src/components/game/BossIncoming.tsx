import { BossIcon } from '@/components/ui/BossIcon';
import { cn } from '@/lib/utils';

interface BossIncomingProps {
  show: boolean;
  bossNumber: number;
}

export function BossIncoming({ show, bossNumber }: BossIncomingProps) {
  if (!show) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-40 flex items-center justify-center",
      "bg-background/90 backdrop-blur-sm",
      "animate-in fade-in-0 duration-300"
    )}>
      <div className="flex flex-col items-center gap-6 animate-boss-incoming">
        <BossIcon className="w-24 h-24 text-destructive boss-glow animate-boss-skull" />
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-4xl md:text-5xl font-bold text-destructive boss-text-glow tracking-wider">
            BOSS #{bossNumber}
          </h2>
          <p className="text-lg text-ghost animate-pulse">
            Prepare-se...
          </p>
        </div>
      </div>
    </div>
  );
}

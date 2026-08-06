import { cn } from '@/lib/utils';

interface BossTimerProps {
  timeRemainingMs: number;
  totalTimeMs: number;
}

export function BossTimer({ timeRemainingMs, totalTimeMs }: BossTimerProps) {
  const progress = Math.max(0, Math.min(1, timeRemainingMs / totalTimeMs));
  const seconds = Math.ceil(timeRemainingMs / 1000);
  const formattedSeconds = String(seconds).padStart(2, '0');

  const isUrgent = seconds <= 5;

  return (
    <div className="w-full max-w-lg flex flex-col items-center select-none mt-2">
      {/* Top thin divider line */}
      <div className="w-full border-t border-slate-800/80 mb-4" />

      {/* Centered 2-digit number (e.g. 08) */}
      <span className={cn(
        "font-mono text-lg font-bold tracking-wider tabular-nums mb-1 transition-colors duration-200",
        isUrgent ? "text-destructive animate-pulse" : "text-emerald-400"
      )}>
        {formattedSeconds}
      </span>

      {/* Thin solid horizontal progress line */}
      <div className="w-full h-[3px] bg-slate-800/80 rounded-full overflow-hidden mb-3">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-75 ease-linear",
            isUrgent ? "bg-destructive animate-pulse" : "bg-emerald-400 shadow-[0_0_8px_#34d399]"
          )}
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* "pressione enter" label below bar */}
      <p className="text-xs font-mono text-slate-500 hidden md:block">
        pressione enter
      </p>
    </div>
  );
}

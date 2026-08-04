import { cn } from '@/lib/utils';

interface BossTimerProps {
  timeRemainingMs: number;
  totalTimeMs: number;
}

export function BossTimer({ timeRemainingMs, totalTimeMs }: BossTimerProps) {
  const progress = Math.max(0, Math.min(1, timeRemainingMs / totalTimeMs));
  const seconds = Math.ceil(timeRemainingMs / 1000);

  const size = 100;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  let ringColor: string;
  let textColorClass: string;
  if (progress > 0.6) {
    ringColor = 'hsl(145, 70%, 45%)';
    textColorClass = 'text-success';
  } else if (progress > 0.3) {
    ringColor = 'hsl(45, 95%, 55%)';
    textColorClass = 'text-primary';
  } else {
    ringColor = 'hsl(0, 85%, 50%)';
    textColorClass = 'text-destructive';
  }

  const isUrgent = seconds <= 5;
  const isCritical = seconds <= 3;

  return (
    <div className={cn("relative flex items-center justify-center", isCritical && "animate-boss-shake")}>
      <svg width={size} height={size} className={cn(isUrgent && !isCritical && "animate-timer-pulse")}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(220, 15%, 18%)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={ringColor} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 50ms linear', filter: `drop-shadow(0 0 ${isUrgent ? 12 : 6}px ${ringColor})` }}
        />
      </svg>
      <span className={cn("absolute text-3xl font-bold tabular-nums", textColorClass, isUrgent && "animate-pulse")}>
        {seconds}
      </span>
    </div>
  );
}

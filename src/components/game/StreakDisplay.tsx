import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakDisplayProps {
  streak: number;
  animate?: boolean;
}

function getStreakClass(streak: number): string {
  if (streak > 100) return 'fire-purple';
  if (streak > 50) return 'fire-red';
  if (streak > 10) return 'fire-orange';
  if (streak >= 1) return 'fire-yellow';
  return 'text-ghost';
}

function getFlameSize(streak: number): string {
  if (streak > 100) return 'w-10 h-10';
  if (streak > 50) return 'w-9 h-9';
  if (streak > 10) return 'w-8 h-8';
  if (streak >= 1) return 'w-7 h-7';
  return 'w-6 h-6';
}

export function StreakDisplay({ streak, animate }: StreakDisplayProps) {
  const colorClass = getStreakClass(streak);
  const sizeClass = getFlameSize(streak);

  if (streak === 0) {
    return (
      <div className="flex items-center gap-2 text-ghost">
        <Flame className="w-6 h-6" />
        <span className="text-2xl font-medium">0</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", colorClass)}>
      <Flame 
        className={cn(
          sizeClass,
          "transition-all duration-300",
          streak > 0 && "flame-dance",
          animate && "streak-pulse"
        )} 
      />
      <span 
        className={cn(
          "text-2xl font-bold transition-all duration-300",
          animate && "streak-pulse"
        )}
      >
        {streak}
      </span>
    </div>
  );
}

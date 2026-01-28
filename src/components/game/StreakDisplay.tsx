import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreakDisplayProps {
  streak: number;
  animate?: boolean;
}

type FireColor = 'yellow' | 'orange' | 'red' | 'purple' | 'none';

function getFireColor(streak: number): FireColor {
  if (streak > 100) return 'purple';
  if (streak > 50) return 'red';
  if (streak > 10) return 'orange';
  if (streak >= 1) return 'yellow';
  return 'none';
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

function getAuraClass(color: FireColor): string {
  switch (color) {
    case 'yellow': return 'flame-aura-yellow';
    case 'orange': return 'flame-aura-orange';
    case 'red': return 'flame-aura-red';
    case 'purple': return 'flame-aura-purple';
    default: return '';
  }
}

function getParticleClass(color: FireColor): string {
  switch (color) {
    case 'yellow': return 'particles-yellow';
    case 'orange': return 'particles-orange';
    case 'red': return 'particles-red';
    case 'purple': return 'particles-purple';
    default: return '';
  }
}

export function StreakDisplay({ streak, animate }: StreakDisplayProps) {
  const colorClass = getStreakClass(streak);
  const sizeClass = getFlameSize(streak);
  const fireColor = getFireColor(streak);
  const auraClass = getAuraClass(fireColor);
  const particleClass = getParticleClass(fireColor);

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
      <div className={cn("relative", auraClass)}>
        {/* Particle effects - quantidade aumenta com o nível */}
        <div className={cn("flame-particles", particleClass)}>
          <span className="particle particle-1" />
          <span className="particle particle-2" />
          <span className="particle particle-3" />
          <span className="particle particle-4" />
          <span className="particle particle-5" />
          <span className="particle particle-6" />
          {/* Mais partículas para níveis mais altos */}
          {(fireColor === 'orange' || fireColor === 'red' || fireColor === 'purple') && (
            <>
              <span className="particle particle-7" />
              <span className="particle particle-8" />
            </>
          )}
          {(fireColor === 'red' || fireColor === 'purple') && (
            <>
              <span className="particle particle-9" />
              <span className="particle particle-10" />
            </>
          )}
          {fireColor === 'purple' && (
            <>
              <span className="particle particle-11" />
              <span className="particle particle-12" />
            </>
          )}
        </div>
        <Flame 
          className={cn(
            sizeClass,
            "relative z-10 transition-all duration-300",
            animate && "streak-pulse"
          )} 
        />
      </div>
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

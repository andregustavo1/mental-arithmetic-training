import { StreakDisplay } from './StreakDisplay';
import { Clock, Target, Zap } from 'lucide-react';

interface StatsBarProps {
  score: number;
  streak: number;
  totalQuestions: number;
  averageTimeMs: number;
  opm: number;
  streakAnimate?: boolean;
}

export function StatsBar({ 
  score, 
  streak, 
  totalQuestions, 
  averageTimeMs, 
  opm,
  streakAnimate 
}: StatsBarProps) {
  const accuracy = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  
  return (
    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 text-dim">
      {/* Score */}
      <div className="flex items-center gap-2">
        <Target className="w-5 h-5 text-primary" />
        <div className="flex flex-col items-start">
          <span className="text-xs uppercase tracking-wider text-ghost">score</span>
          <span className="text-xl font-bold text-highlight">{score}</span>
        </div>
      </div>

      {/* Streak */}
      <div className="flex flex-col items-center">
        <span className="text-xs uppercase tracking-wider text-ghost mb-1">streak</span>
        <StreakDisplay streak={streak} animate={streakAnimate} />
      </div>

      {/* Accuracy */}
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-start">
          <span className="text-xs uppercase tracking-wider text-ghost">precisão</span>
          <span className="text-xl font-bold text-highlight">{accuracy}%</span>
        </div>
      </div>

      {/* OPM */}
      <div className="flex items-center gap-2">
        <Zap className="w-5 h-5 text-primary" />
        <div className="flex flex-col items-start">
          <span className="text-xs uppercase tracking-wider text-ghost">opm</span>
          <span className="text-xl font-bold text-highlight">{Math.round(opm)}</span>
        </div>
      </div>

      {/* Average Time */}
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary" />
        <div className="flex flex-col items-start">
          <span className="text-xs uppercase tracking-wider text-ghost">tempo médio</span>
          <span className="text-xl font-bold text-highlight">
            {averageTimeMs > 0 ? (averageTimeMs / 1000).toFixed(1) : '0.0'}s
          </span>
        </div>
      </div>
    </div>
  );
}

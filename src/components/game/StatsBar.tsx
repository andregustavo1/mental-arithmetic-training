interface StatsBarProps {
  totalQuestions: number;
  opm: number;
  correctAnswers: number;
}

export function StatsBar({ 
  totalQuestions, 
  opm,
  correctAnswers
}: StatsBarProps) {
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  
  return (
    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 text-dim">
      {/* Accuracy */}
      <div className="flex flex-col items-center">
        <span className="text-xs uppercase tracking-wider text-ghost">precisão</span>
        <span className="text-xl font-bold text-highlight">{accuracy}%</span>
      </div>

      {/* OPM */}
      <div className="flex flex-col items-center">
        <span className="text-xs uppercase tracking-wider text-ghost">opm</span>
        <span className="text-xl font-bold text-highlight">{Math.round(opm)}</span>
      </div>
    </div>
  );
}
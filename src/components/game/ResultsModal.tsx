import { useEffect } from 'react';
import { GameStats, QuestionResult } from '@/types/game';
import { ConsistencyChart } from './ConsistencyChart';
import { Button } from '@/components/ui/button';
import { Trophy, Target, Zap, Clock, Flame, RotateCcw, TrendingUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface ResultsModalProps {
  open: boolean;
  onClose: () => void;
  onRestart: () => void;
  stats: GameStats;
  results: QuestionResult[];
  allTimeBestStreak: number;
  allTimeBestOpm: number;
}

export function ResultsModal({ 
  open, 
  onClose, 
  onRestart, 
  stats, 
  results,
  allTimeBestStreak,
  allTimeBestOpm 
}: ResultsModalProps) {
  const isNewStreakRecord = stats.bestStreak >= allTimeBestStreak && stats.bestStreak > 0;
  const isNewOpmRecord = stats.opm >= allTimeBestOpm && stats.opm > 0;

  // Bloquear scroll do body quando modal está aberto
  useBodyScrollLock(open);

  if (!open) return null;

  return (
    <>
      {/* Backdrop with blur */}
      <div 
        className={cn(
          "fixed inset-0 z-50 bg-background/80 backdrop-blur-md",
          "animate-in fade-in-0 duration-300"
        )}
        onClick={onClose}
      />
      
      {/* Modal Container - prevents zoom and handles scroll */}
      <div 
        className="fixed inset-0 z-50 overflow-hidden"
        onClick={onClose}
      >
        <div 
          className="h-full overflow-y-auto overscroll-none touch-pan-y"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="min-h-full flex items-start md:items-center justify-center p-2 md:p-4 pb-8">
            <div 
              className={cn(
                "relative w-full max-w-2xl my-2 md:my-8",
                "bg-card border border-border rounded-xl shadow-2xl",
                "animate-in zoom-in-95 fade-in-0 duration-300"
              )}
              onClick={(e) => e.stopPropagation()}
            >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-card border-b border-border px-4 md:px-6 py-3 md:py-4 flex items-center justify-between rounded-t-xl">
              <h2 className="text-lg md:text-2xl font-bold text-highlight flex items-center gap-2 md:gap-3">
                <Trophy className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                Resultados
              </h2>
              <button 
                onClick={onClose}
                className="p-2 rounded-lg text-muted-foreground hover:text-highlight hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Main Stats Grid */}
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <div className="bg-secondary/50 rounded-lg p-2.5 md:p-4 text-center">
                  <Target className="w-4 h-4 md:w-6 md:h-6 text-primary mx-auto mb-1 md:mb-2" />
                  <p className="text-[10px] md:text-xs uppercase tracking-wider text-ghost mb-0.5 md:mb-1">Score</p>
                  <p className="text-lg md:text-2xl font-bold text-highlight">{stats.correctAnswers}</p>
                  <p className="text-[10px] md:text-sm text-muted-foreground">de {stats.totalQuestions}</p>
                </div>

                <div className="bg-secondary/50 rounded-lg p-2.5 md:p-4 text-center">
                  <div className="flex justify-center mb-1 md:mb-2">
                    <Flame className={`w-4 h-4 md:w-6 md:h-6 ${isNewStreakRecord ? 'text-fire-purple' : 'text-primary'}`} />
                  </div>
                  <p className="text-[10px] md:text-xs uppercase tracking-wider text-ghost mb-0.5 md:mb-1">Melhor Streak</p>
                  <p className={`text-lg md:text-2xl font-bold ${isNewStreakRecord ? 'fire-purple' : 'text-highlight'}`}>
                    {stats.bestStreak}
                    {isNewStreakRecord && <span className="text-xs md:text-sm ml-1">🏆</span>}
                  </p>
                  <p className="text-[10px] md:text-sm text-muted-foreground">recorde: {allTimeBestStreak}</p>
                </div>

                <div className="bg-secondary/50 rounded-lg p-2.5 md:p-4 text-center">
                  <Zap className={`w-4 h-4 md:w-6 md:h-6 mx-auto mb-1 md:mb-2 text-primary`} />
                  <p className="text-[10px] md:text-xs uppercase tracking-wider text-ghost mb-0.5 md:mb-1">OPM</p>
                  <p className={`text-lg md:text-2xl font-bold ${isNewOpmRecord ? 'text-primary' : 'text-highlight'}`}>
                    {Math.round(stats.opm)}
                    {isNewOpmRecord && <span className="text-xs md:text-sm ml-1">🏆</span>}
                  </p>
                  <p className="text-[10px] md:text-sm text-muted-foreground">recorde: {Math.round(allTimeBestOpm)}</p>
                </div>

                <div className="bg-secondary/50 rounded-lg p-2.5 md:p-4 text-center">
                  <Clock className="w-4 h-4 md:w-6 md:h-6 text-primary mx-auto mb-1 md:mb-2" />
                  <p className="text-[10px] md:text-xs uppercase tracking-wider text-ghost mb-0.5 md:mb-1">Tempo Médio</p>
                  <p className="text-lg md:text-2xl font-bold text-highlight">
                    {(stats.averageTimeMs / 1000).toFixed(1)}s
                  </p>
                  <p className="text-[10px] md:text-sm text-muted-foreground">por questão</p>
                </div>
              </div>

              {/* Accuracy Bar */}
              <div className="bg-secondary/30 rounded-lg p-3 md:p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs md:text-sm text-muted-foreground">Precisão</span>
                  <span className="text-base md:text-lg font-bold text-highlight">{Math.round(stats.accuracy)}%</span>
                </div>
                <div className="h-2 md:h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-500 rounded-full"
                    style={{ width: `${stats.accuracy}%` }}
                  />
                </div>
              </div>

              {/* Consistency Chart */}
              <div className="bg-secondary/30 rounded-lg p-3 md:p-4">
                <h3 className="flex items-center gap-2 text-sm md:text-lg font-semibold text-highlight mb-3 md:mb-4">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                  Gráfico de Consistência
                </h3>
                <div className="h-32 md:h-auto">
                  <ConsistencyChart results={results} />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-card border-t border-border px-4 md:px-6 py-3 md:py-4 rounded-b-xl">
              <div className="flex gap-2 md:gap-3">
                <Button 
                  onClick={onRestart}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 text-sm md:text-base py-2 md:py-2.5"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Jogar Novamente
                </Button>
                <Button 
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 text-sm md:text-base py-2 md:py-2.5"
                >
                  Fechar
                </Button>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

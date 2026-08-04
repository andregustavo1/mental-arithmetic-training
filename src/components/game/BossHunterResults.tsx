import { BossHunterStats, QuestionResult, getBossHunterTitle } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Skull, Swords, Clock, Zap, Crown, Target, RotateCcw, X, AlertTriangle, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface BossHunterResultsProps {
  open: boolean;
  onClose: () => void;
  onRestart: () => void;
  stats: BossHunterStats;
  results: QuestionResult[];
  gameOverReason?: 'wrong_answer' | 'timeout';
  bestRun: number;
  bestBosses: number;
}

function getTitleColor(level: number): string {
  switch (level) {
    case 1: return 'text-ghost';
    case 2: return 'text-dim';
    case 3: return 'fire-yellow';
    case 4: return 'fire-orange';
    case 5: return 'fire-red';
    case 6: return 'fire-blue';
    case 7: return 'fire-purple';
    case 8: return 'fire-purple';
    default: return 'text-highlight';
  }
}

function getGameOverMessage(reason?: 'wrong_answer' | 'timeout'): { title: string; icon: React.ReactNode; colorClass: string } {
  switch (reason) {
    case 'wrong_answer':
      return { title: 'Resposta Incorreta!', icon: <AlertTriangle className="w-6 h-6" />, colorClass: 'text-destructive' };
    case 'timeout':
      return { title: 'Tempo Esgotado!', icon: <Timer className="w-6 h-6" />, colorClass: 'text-destructive' };
    default:
      return { title: 'Run Encerrada', icon: <Swords className="w-6 h-6" />, colorClass: 'text-primary' };
  }
}

export function BossHunterResults({ open, onClose, onRestart, stats, results, gameOverReason, bestRun, bestBosses }: BossHunterResultsProps) {
  useBodyScrollLock(open);
  if (!open) return null;

  const { title: rankTitle, level } = getBossHunterTitle(stats.totalOperations);
  const titleColor = getTitleColor(level);
  const gameOver = getGameOverMessage(gameOverReason);
  const isNewBestRun = stats.totalOperations > bestRun && stats.totalOperations > 0;
  const isNewBestBosses = stats.bossesDefeated > bestBosses && stats.bossesDefeated > 0;
  const lastResult = results.length > 0 ? results[results.length - 1] : null;

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  };

  return (
    <>
      <div className={cn("fixed inset-0 z-50 bg-background/80 backdrop-blur-md", "animate-in fade-in-0 duration-300")} onClick={onClose} />
      <div className="fixed inset-0 z-50 overflow-hidden p-2 md:p-4" onClick={onClose}>
        <div className="h-full flex items-start md:items-center justify-center">
          <div
            className={cn("relative w-full max-w-2xl max-h-[85vh] flex flex-col", "bg-card border border-border rounded-xl shadow-2xl", "animate-in zoom-in-95 fade-in-0 duration-300")}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-card border-b border-border px-4 md:px-6 py-3 md:py-4 flex items-center justify-between rounded-t-xl">
              <h2 className={cn("text-lg md:text-2xl font-bold flex items-center gap-2 md:gap-3", gameOver.colorClass)}>
                {gameOver.icon}
                {gameOver.title}
              </h2>
              <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-highlight hover:bg-secondary transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="minimal-scrollbar flex-1 min-h-0 overflow-y-scroll overscroll-contain p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Wrong answer detail */}
              {gameOverReason === 'wrong_answer' && lastResult && !lastResult.isCorrect && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 md:p-4 text-center">
                  <p className="text-sm text-ghost mb-1">Operação que encerrou a run:</p>
                  <p className="text-lg font-mono text-highlight">
                    {lastResult.question.x1} {lastResult.question.displayOperation} {lastResult.question.x2} = {lastResult.question.answer}
                  </p>
                  <p className="text-sm text-destructive mt-1">
                    Sua resposta: <span className="font-bold">{lastResult.userAnswer}</span>
                  </p>
                </div>
              )}

              {/* Rank */}
              <div className="text-center py-2">
                <Crown className="w-8 h-8 md:w-10 md:h-10 text-primary mx-auto mb-2" />
                <p className="text-xs uppercase tracking-wider text-ghost mb-1">Rank Alcançado</p>
                <p className={cn("text-2xl md:text-4xl font-bold", titleColor)}>{rankTitle}</p>
                {level === 8 && <p className="text-xs text-primary mt-1 animate-pulse">✨ Rank Máximo! ✨</p>}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <div className="bg-secondary/50 rounded-lg p-2.5 md:p-4 text-center">
                  <Target className="w-4 h-4 md:w-6 md:h-6 text-primary mx-auto mb-1 md:mb-2" />
                  <p className="text-[10px] md:text-xs uppercase tracking-wider text-ghost mb-0.5 md:mb-1">Operações</p>
                  <p className="text-lg md:text-2xl font-bold text-highlight">
                    {stats.totalOperations}
                    {isNewBestRun && <span className="text-xs md:text-sm ml-1">🏆</span>}
                  </p>
                  <p className="text-[10px] md:text-sm text-muted-foreground">recorde: {Math.max(bestRun, stats.totalOperations)}</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-2.5 md:p-4 text-center">
                  <Skull className="w-4 h-4 md:w-6 md:h-6 text-destructive mx-auto mb-1 md:mb-2" />
                  <p className="text-[10px] md:text-xs uppercase tracking-wider text-ghost mb-0.5 md:mb-1">Bosses Caçados</p>
                  <p className="text-lg md:text-2xl font-bold text-highlight">
                    {stats.bossesDefeated}
                    {isNewBestBosses && <span className="text-xs md:text-sm ml-1">🏆</span>}
                  </p>
                  <p className="text-[10px] md:text-sm text-muted-foreground">recorde: {Math.max(bestBosses, stats.bossesDefeated)}</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-2.5 md:p-4 text-center">
                  <Zap className="w-4 h-4 md:w-6 md:h-6 text-primary mx-auto mb-1 md:mb-2" />
                  <p className="text-[10px] md:text-xs uppercase tracking-wider text-ghost mb-0.5 md:mb-1">OPM</p>
                  <p className="text-lg md:text-2xl font-bold text-highlight">{Math.round(stats.opm)}</p>
                  <p className="text-[10px] md:text-sm text-muted-foreground">ops/minuto</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-2.5 md:p-4 text-center">
                  <Clock className="w-4 h-4 md:w-6 md:h-6 text-primary mx-auto mb-1 md:mb-2" />
                  <p className="text-[10px] md:text-xs uppercase tracking-wider text-ghost mb-0.5 md:mb-1">Tempo Total</p>
                  <p className="text-lg md:text-2xl font-bold text-highlight">{formatDuration(stats.sessionDurationMs)}</p>
                  <p className="text-[10px] md:text-sm text-muted-foreground">média: {(stats.averageTimeMs / 1000).toFixed(1)}s/op</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-card border-t border-border px-4 md:px-6 py-3 md:py-4 rounded-b-xl">
              <div className="flex gap-2 md:gap-3">
                <Button onClick={onRestart} className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 text-sm md:text-base py-2 md:py-2.5">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Caçar Novamente
                </Button>
                <Button onClick={onClose} variant="outline" className="flex-1 text-sm md:text-base py-2 md:py-2.5">Fechar</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

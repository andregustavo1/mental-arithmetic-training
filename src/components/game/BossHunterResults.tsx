import { BossHunterStats, QuestionResult, getBossHunterTitle } from '@/types/game';
import { Button } from '@/components/ui/button';
import {
  Swords, Clock, Zap, Target, RotateCcw, X, AlertTriangle, Timer,
  Sprout, Shield, Crosshair, Award, Flame, Lightbulb, Sparkles, Brain
} from 'lucide-react';
import { BossIcon } from '@/components/ui/BossIcon';
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

interface RankUI {
  level: number;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  titleClass: string;
  glowBg: string;
}

const RANK_UI_CONFIGS: Record<number, RankUI> = {
  1: {
    level: 1,
    title: 'Novato',
    icon: Sprout,
    iconClass: 'w-10 h-10 md:w-12 md:h-12 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)] animate-pulse',
    titleClass: 'text-emerald-400 font-bold text-2xl md:text-3xl',
    glowBg: 'from-emerald-500/10 via-transparent to-transparent',
  },
  2: {
    level: 2,
    title: 'Guerreiro',
    icon: Swords,
    iconClass: 'w-10 h-10 md:w-12 md:h-12 text-slate-200 drop-shadow-[0_0_15px_rgba(203,213,225,0.6)] animate-pulse',
    titleClass: 'text-slate-200 font-extrabold text-2xl md:text-3xl tracking-wide',
    glowBg: 'from-slate-400/10 via-transparent to-transparent',
  },
  3: {
    level: 3,
    title: 'Caçador',
    icon: Crosshair,
    iconClass: 'w-11 h-11 md:w-14 md:h-14 text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.7)] animate-pulse',
    titleClass: 'fire-yellow font-extrabold text-3xl md:text-4xl tracking-wide',
    glowBg: 'from-amber-500/15 via-transparent to-transparent',
  },
  4: {
    level: 4,
    title: 'Mestre',
    icon: Award,
    iconClass: 'w-12 h-12 md:w-14 md:h-14 text-orange-500 drop-shadow-[0_0_25px_rgba(249,115,22,0.8)] animate-bounce',
    titleClass: 'fire-orange font-black text-3xl md:text-4xl tracking-wider',
    glowBg: 'from-orange-500/20 via-transparent to-transparent',
  },
  5: {
    level: 5,
    title: 'Lenda',
    icon: Flame,
    iconClass: 'w-12 h-12 md:w-16 md:h-16 text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.9)] flame-dance',
    titleClass: 'fire-red font-black text-3xl md:text-4xl tracking-wider',
    glowBg: 'from-red-500/25 via-transparent to-transparent',
  },
  6: {
    level: 6,
    title: 'Gênio',
    icon: Lightbulb,
    iconClass: 'w-12 h-12 md:w-16 md:h-16 text-cyan-400 drop-shadow-[0_0_35px_rgba(34,211,238,0.95)] animate-pulse scale-110',
    titleClass: 'fire-blue font-black text-3xl md:text-4xl tracking-widest',
    glowBg: 'from-cyan-500/25 via-transparent to-transparent',
  },
  7: {
    level: 7,
    title: 'Grande Gênio',
    icon: Sparkles,
    iconClass: 'w-14 h-14 md:w-16 md:h-16 text-purple-400 drop-shadow-[0_0_40px_rgba(192,132,252,1)] animate-spin-slow scale-110',
    titleClass: 'fire-purple font-black text-3xl md:text-5xl tracking-widest',
    glowBg: 'from-purple-500/30 via-transparent to-transparent',
  },
  8: {
    level: 8,
    title: 'Absolute Genius!',
    icon: Brain,
    iconClass: 'w-16 h-16 md:w-20 md:h-20 text-pink-400 drop-shadow-[0_0_45px_rgba(244,114,182,1)] animate-brain-pulse scale-125',
    titleClass: 'bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400 bg-clip-text text-transparent font-black text-3xl md:text-5xl tracking-widest animate-pulse',
    glowBg: 'from-pink-500/30 via-purple-500/15 to-amber-500/10',
  },
};

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

  const { level } = getBossHunterTitle(stats.totalOperations);
  const rankUI = RANK_UI_CONFIGS[level] || RANK_UI_CONFIGS[1];
  const RankIconComponent = rankUI.icon;
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

              {/* Unique Animated Rank Display */}
              <div className={cn(
                "relative overflow-hidden rounded-xl p-5 md:p-6 text-center border border-border/60 shadow-xl flex flex-col items-center gap-2 md:gap-3",
                `bg-gradient-to-b ${rankUI.glowBg} to-secondary/30`
              )}>
                {/* Glowing Icon */}
                <div className="relative py-1 md:py-2 flex items-center justify-center">
                  <RankIconComponent className={rankUI.iconClass} />
                </div>

                {/* Subtitle */}
                <p className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-ghost">Rank Alcançado</p>

                {/* Title */}
                <h3 className={rankUI.titleClass}>{rankUI.title}</h3>
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
                  <BossIcon className="w-4 h-4 md:w-6 md:h-6 text-destructive mx-auto mb-1 md:mb-2" />
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

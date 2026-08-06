import { useState } from 'react';
import { SessionHistory } from '@/types/game';
import { Button } from '@/components/ui/button';
import { X, BarChart3, Trophy, Zap, Clock, Target, Flame, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { BossIcon } from '@/components/ui/BossIcon';
import { cn } from '@/lib/utils';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface HistoryModalProps {
  open: boolean;
  onClose: () => void;
  sessions: SessionHistory[];
  allTimeBestStreak: number;
  allTimeBestOpm: number;
  bossHunterBestBosses?: number;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
}

export function HistoryModal({ 
  open, 
  onClose, 
  sessions,
  allTimeBestStreak,
  allTimeBestOpm,
  bossHunterBestBosses = 0
}: HistoryModalProps) {
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  // Bloquear scroll do body quando modal está aberto
  useBodyScrollLock(open);

  if (!open) return null;

  const toggleExpand = (id: string) => {
    setExpandedSessionId(prev => (prev === id ? null : id));
  };

  // Compute best values dynamically across saved sessions or fallback to state
  const bestStreak = Math.max(
    allTimeBestStreak || 0,
    ...sessions.map(s => s.stats.bestStreak || 0)
  );

  const bestBosses = Math.max(
    bossHunterBestBosses || 0,
    ...sessions.map(s => s.bossHunterStats?.bossesDefeated || 0)
  );

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
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-hidden p-4">
        <div className="h-full flex items-center justify-center">
          <div 
            className={cn(
              "relative w-full max-w-2xl h-[85vh] max-h-[calc(100vh-2rem)] flex flex-col",
              "bg-card border border-border rounded-xl shadow-2xl",
              "animate-in zoom-in-95 fade-in-0 duration-300"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Fixed */}
            <div className="flex-shrink-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h2 className="text-2xl font-bold text-highlight flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-primary" />
                Histórico de Sessões
              </h2>
              <button 
                onClick={onClose}
                className="p-2 rounded-lg text-muted-foreground hover:text-highlight hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary Stats */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-border">
              <div className="grid grid-cols-2 gap-4">
                {/* Left: Melhor Streak */}
                <div className="bg-secondary/50 rounded-lg p-3 flex items-center gap-3 border border-border/40">
                  <Flame className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-ghost uppercase font-medium">Melhor Streak</p>
                    <p className="text-lg font-bold text-highlight">{bestStreak}</p>
                  </div>
                </div>

                {/* Right: Melhor Caçada */}
                <div className="bg-secondary/50 rounded-lg p-3 flex items-center gap-3 border border-border/40">
                  <BossIcon className="w-5 h-5 text-destructive" />
                  <div>
                    <p className="text-xs text-ghost uppercase font-medium">Melhor Caçada</p>
                    <p className="text-lg font-bold text-white flex items-center gap-1">
                      {bestBosses} <span className="text-xs font-normal opacity-80"></span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 min-h-0 overflow-hidden">
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 text-ghost">
                  <BarChart3 className="w-12 h-12 mb-4 opacity-50" />
                  <p className="text-lg">Nenhuma sessão registrada</p>
                  <p className="text-sm">Complete uma sessão para ver seu histórico</p>
                </div>
              ) : (
                <div className="minimal-scrollbar h-full overflow-y-auto">
                  <div className="p-6 space-y-3">
                    {sessions.map((session, index) => {
                      const isBossHunter = session.gameMode === 'bossHunter';
                      const isExpanded = expandedSessionId === session.id;
                      const bossesDefeated = session.bossHunterStats?.bossesDefeated ?? 0;

                      return (
                        <div 
                          key={session.id}
                          className={cn(
                            "rounded-lg border transition-all overflow-hidden bg-secondary/30",
                            isBossHunter 
                              ? "hover:border-destructive/60 hover:bg-secondary/50" 
                              : "border-border/50 hover:bg-secondary/50"
                          )}
                        >
                          <div className="p-4 pb-3">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-ghost">
                                  {formatDate(session.date)}
                                </span>
                                <span className={cn(
                                  "text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border",
                                  isBossHunter
                                    ? "bg-destructive/10 text-destructive border-destructive/40 flex items-center"
                                    : "bg-primary/10 text-primary border-primary/30"
                                )}>
                                  {isBossHunter ? (
                                    <>
                                      <div className="text-destructive inline" />
                                      Boss Hunter
                                    </>
                                  ) : (
                                    'Clássico'
                                  )}
                                </span>
                              </div>
                              <span className="text-xs text-ghost">
                                #{sessions.length - index}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-4 gap-2 text-center">
                              <div>
                                <Target className={cn("w-4 h-4 mx-auto mb-1", isBossHunter ? "text-destructive" : "text-primary")} />
                                <p className="text-xs text-ghost">Score</p>
                                <p className="font-bold text-highlight">
                                  {session.stats.correctAnswers}/{session.stats.totalQuestions}
                                </p>
                              </div>

                              {isBossHunter ? (
                                <div>
                                  <BossIcon className="w-4 h-4 mx-auto mb-1 text-destructive" />
                                  <p className="text-xs text-ghost">Bosses</p>
                                  <p className="font-bold text-white">
                                    {bossesDefeated}
                                  </p>
                                </div>
                              ) : (
                                <div>
                                  <Flame className="w-4 h-4 mx-auto mb-1 text-primary" />
                                  <p className="text-xs text-ghost">Streak</p>
                                  <p className={cn(
                                    "font-bold",
                                    session.stats.bestStreak === bestStreak && session.stats.bestStreak > 0
                                      ? "text-primary"
                                      : "text-highlight"
                                  )}>
                                    {session.stats.bestStreak}
                                    {session.stats.bestStreak === bestStreak && session.stats.bestStreak > 0 && (
                                      <Trophy className="w-3 h-3 inline ml-1 text-primary" />
                                    )}
                                  </p>
                                </div>
                              )}

                              <div>
                                <Zap className={cn("w-4 h-4 mx-auto mb-1", isBossHunter ? "text-destructive" : "text-primary")} />
                                <p className="text-xs text-ghost">OPM</p>
                                <p className="font-bold text-highlight">
                                  {Math.round(session.stats.opm)}
                                </p>
                              </div>
                              <div>
                                <Clock className={cn("w-4 h-4 mx-auto mb-1", isBossHunter ? "text-destructive" : "text-primary")} />
                                <p className="text-xs text-ghost">Duração</p>
                                <p className="font-bold text-highlight">
                                  {formatDuration(session.stats.sessionDurationMs)}
                                </p>
                              </div>
                            </div>
                            
                            {/* Accuracy bar */}
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-ghost">Precisão</span>
                                <span className={isBossHunter ? "text-destructive font-medium" : "text-highlight"}>
                                  {Math.round(session.stats.accuracy)}%
                                </span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={cn("h-full rounded-full", isBossHunter ? "bg-destructive" : "bg-primary")}
                                  style={{ width: `${session.stats.accuracy}%` }}
                                />
                              </div>
                            </div>

                            {/* Expand / Details Toggle Button */}
                            <button
                              onClick={() => toggleExpand(session.id)}
                              className="mt-3 w-full py-1.5 px-3 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1.5 border border-border/40 bg-secondary/50 text-dim hover:text-highlight hover:bg-secondary"
                            >
                              <span>{isExpanded ? 'Ocultar detalhes' : 'Ver detalhes das operações'}</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          {/* Expanded Details Section */}
                          {isExpanded && (
                            <div className="bg-background/60 border-t border-border/40 p-4 space-y-2 text-xs">
                              <p className="font-semibold text-ghost mb-2 uppercase tracking-wider text-[10px]">
                                Histórico de Operações ({session.results?.length || 0})
                              </p>
                              
                              {(!session.results || session.results.length === 0) ? (
                                <p className="text-ghost italic py-2 text-center">
                                  Nenhum detalhe de operações gravado para esta sessão antiga.
                                </p>
                              ) : (
                                <div className="space-y-1.5 max-h-48 overflow-y-auto minimal-scrollbar pr-1">
                                  {session.results.map((res, qIdx) => {
                                    const isBossOp = isBossHunter && (qIdx + 1) % 5 === 0;
                                    return (
                                      <div
                                        key={qIdx}
                                        className={cn(
                                          "flex items-center justify-between px-3 py-1.5 rounded border text-xs font-mono",
                                          res.isCorrect
                                            ? "border-success/30 bg-success/5 text-highlight"
                                            : "border-destructive/40 bg-destructive/10 text-highlight"
                                        )}
                                      >
                                        <div className="flex items-center gap-2">
                                          <span className="text-[10px] text-ghost font-sans">#{qIdx + 1}</span>
                                          {isBossOp && (
                                            <span className="text-[9px] uppercase px-1 py-0.5 rounded bg-destructive/20 text-destructive font-sans font-bold flex items-center gap-0.5">
                                              <BossIcon className="w-2.5 h-2.5 inline" /> BOSS
                                            </span>
                                          )}
                                          <span>
                                            {res.question.x1} {res.question.displayOperation} {res.question.x2} = {res.question.answer}
                                          </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                          <span className="text-[10px] text-ghost font-sans">
                                            {(res.timeMs / 1000).toFixed(1)}s
                                          </span>
                                          {res.isCorrect ? (
                                            <span className="text-success flex items-center gap-1 font-sans">
                                              <Check className="w-3.5 h-3.5" />
                                              <span className="font-mono">{res.userAnswer}</span>
                                            </span>
                                          ) : (
                                            <div className="flex items-center gap-1.5">
                                              <span className="text-destructive line-through font-mono">
                                                {res.userAnswer}
                                              </span>
                                              <span className="text-success font-mono font-bold">
                                                ({res.question.answer})
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 bg-card border-t border-border px-6 py-4 rounded-b-xl">
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

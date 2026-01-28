import { SessionHistory } from '@/types/game';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { X, BarChart3, Trophy, Zap, Clock, Target, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface HistoryModalProps {
  open: boolean;
  onClose: () => void;
  sessions: SessionHistory[];
  allTimeBestStreak: number;
  allTimeBestOpm: number;
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
  allTimeBestOpm
}: HistoryModalProps) {
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
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto overscroll-contain">
        <div 
          className={cn(
            "relative w-full max-w-2xl max-h-[85vh] flex flex-col",
            "bg-card border border-border rounded-xl shadow-2xl",
            "animate-in zoom-in-95 fade-in-0 duration-300",
            "overscroll-contain"
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
              <div className="bg-secondary/50 rounded-lg p-3 flex items-center gap-3">
                <Flame className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-ghost uppercase">Melhor Streak</p>
                  <p className="text-lg font-bold text-highlight">{allTimeBestStreak}</p>
                </div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 flex items-center gap-3">
                <Zap className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-ghost uppercase">Melhor OPM</p>
                  <p className="text-lg font-bold text-highlight">{Math.round(allTimeBestOpm)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-hidden">
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-ghost">
                <BarChart3 className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-lg">Nenhuma sessão registrada</p>
                <p className="text-sm">Complete uma sessão para ver seu histórico</p>
              </div>
            ) : (
              <ScrollArea className="h-full max-h-[50vh]">
                <div className="p-6 space-y-3">
                  {sessions.map((session, index) => (
                    <div 
                      key={session.id}
                      className={cn(
                        "bg-secondary/30 rounded-lg p-4 border border-border/50",
                        "hover:bg-secondary/50 transition-colors"
                      )}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-ghost">
                          {formatDate(session.date)}
                        </span>
                        <span className="text-xs text-ghost">
                          #{sessions.length - index}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div>
                          <Target className="w-4 h-4 mx-auto mb-1 text-primary" />
                          <p className="text-xs text-ghost">Score</p>
                          <p className="font-bold text-highlight">
                            {session.stats.correctAnswers}/{session.stats.totalQuestions}
                          </p>
                        </div>
                        <div>
                          <Flame className="w-4 h-4 mx-auto mb-1 text-primary" />
                          <p className="text-xs text-ghost">Streak</p>
                          <p className={cn(
                            "font-bold",
                            session.stats.bestStreak === allTimeBestStreak && session.stats.bestStreak > 0
                              ? "text-primary"
                              : "text-highlight"
                          )}>
                            {session.stats.bestStreak}
                            {session.stats.bestStreak === allTimeBestStreak && session.stats.bestStreak > 0 && (
                              <Trophy className="w-3 h-3 inline ml-1 text-primary" />
                            )}
                          </p>
                        </div>
                        <div>
                          <Zap className="w-4 h-4 mx-auto mb-1 text-primary" />
                          <p className="text-xs text-ghost">OPM</p>
                          <p className={cn(
                            "font-bold",
                            Math.round(session.stats.opm) === Math.round(allTimeBestOpm) && session.stats.opm > 0
                              ? "text-primary"
                              : "text-highlight"
                          )}>
                            {Math.round(session.stats.opm)}
                          </p>
                        </div>
                        <div>
                          <Clock className="w-4 h-4 mx-auto mb-1 text-primary" />
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
                          <span className="text-highlight">{Math.round(session.stats.accuracy)}%</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${session.stats.accuracy}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
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
    </>
  );
}

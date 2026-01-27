import { GameStats, QuestionResult } from '@/types/game';
import { ConsistencyChart } from './ConsistencyChart';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Target, Zap, Clock, Flame, RotateCcw, TrendingUp } from 'lucide-react';

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-highlight flex items-center gap-3">
            <Trophy className="w-7 h-7 text-primary" />
            Resultados da Sessão
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-secondary/50 rounded-lg p-4 text-center">
              <Target className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-xs uppercase tracking-wider text-ghost mb-1">Score</p>
              <p className="text-2xl font-bold text-highlight">{stats.correctAnswers}</p>
              <p className="text-sm text-muted-foreground">de {stats.totalQuestions}</p>
            </div>

            <div className="bg-secondary/50 rounded-lg p-4 text-center">
              <div className="flex justify-center mb-2">
                <Flame className={`w-6 h-6 ${isNewStreakRecord ? 'text-fire-purple' : 'text-primary'}`} />
              </div>
              <p className="text-xs uppercase tracking-wider text-ghost mb-1">Melhor Streak</p>
              <p className={`text-2xl font-bold ${isNewStreakRecord ? 'fire-purple' : 'text-highlight'}`}>
                {stats.bestStreak}
                {isNewStreakRecord && <span className="text-sm ml-1">🏆</span>}
              </p>
              <p className="text-sm text-muted-foreground">recorde: {allTimeBestStreak}</p>
            </div>

            <div className="bg-secondary/50 rounded-lg p-4 text-center">
              <Zap className={`w-6 h-6 mx-auto mb-2 ${isNewOpmRecord ? 'text-primary' : 'text-primary'}`} />
              <p className="text-xs uppercase tracking-wider text-ghost mb-1">OPM</p>
              <p className={`text-2xl font-bold ${isNewOpmRecord ? 'text-primary' : 'text-highlight'}`}>
                {Math.round(stats.opm)}
                {isNewOpmRecord && <span className="text-sm ml-1">🏆</span>}
              </p>
              <p className="text-sm text-muted-foreground">recorde: {Math.round(allTimeBestOpm)}</p>
            </div>

            <div className="bg-secondary/50 rounded-lg p-4 text-center">
              <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-xs uppercase tracking-wider text-ghost mb-1">Tempo Médio</p>
              <p className="text-2xl font-bold text-highlight">
                {(stats.averageTimeMs / 1000).toFixed(1)}s
              </p>
              <p className="text-sm text-muted-foreground">por questão</p>
            </div>
          </div>

          {/* Accuracy Bar */}
          <div className="bg-secondary/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Precisão</span>
              <span className="text-lg font-bold text-highlight">{Math.round(stats.accuracy)}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 rounded-full"
                style={{ width: `${stats.accuracy}%` }}
              />
            </div>
          </div>

          {/* Consistency Chart */}
          <div className="bg-secondary/30 rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-highlight mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              Gráfico de Consistência
            </h3>
            <ConsistencyChart results={results} />
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-2">
            <Button 
              onClick={onRestart}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Jogar Novamente
            </Button>
            <Button 
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Voltar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

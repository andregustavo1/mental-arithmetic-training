import { useState, useCallback, useEffect, useRef } from 'react';
import { QuestionDisplay } from './QuestionDisplay';
import { AnswerInput } from './AnswerInput';
import { BossTimer } from './BossTimer';
import { BossIncoming } from './BossIncoming';
import { BossHunterResults } from './BossHunterResults';
import { useBossHunterState, isBossOperation } from '@/hooks/useBossHunterState';
import { useGameSounds } from '@/hooks/useSound';
import { GameSettings, Question, BossHunterStats } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Swords, Square, Skull, Shield, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BossHunterAreaProps {
  settings: GameSettings;
  onUpdateStats: (stats: BossHunterStats) => void;
  bestRun: number;
  bestBosses: number;
}

const ANIMATION_DURATION = 300;

export function BossHunterArea({ settings, onUpdateStats, bestRun, bestBosses }: BossHunterAreaProps) {
  const {
    state, phase, bossTimeRemainingMs,
    startGame, submitAnswer, endGame, resetGame, triggerGameOver, calculateStats,
  } = useBossHunterState(settings);

  const {
    playCorrect, playWrong, playBossIncoming, playBossDefeated,
    playGameOver, playKeypress, playTimerTick, playTimerUrgent,
  } = useGameSounds(settings.soundEnabled);

  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [showResults, setShowResults] = useState(false);
  const [displayedQuestion, setDisplayedQuestion] = useState<Question | null>(null);

  const currentQuestionRef = useRef<Question | null>(null);
  useEffect(() => { currentQuestionRef.current = state.currentQuestion; }, [state.currentQuestion]);

  // Sync displayed question on game start
  useEffect(() => {
    if (state.isPlaying && state.currentQuestion && !displayedQuestion) {
      setDisplayedQuestion(state.currentQuestion);
    }
  }, [state.sessionStartTime]);

  // Boss timer sounds
  const prevSecondsRef = useRef(16);
  useEffect(() => {
    if (phase !== 'boss_active') { prevSecondsRef.current = 16; return; }
    const seconds = Math.ceil(bossTimeRemainingMs / 1000);
    if (seconds !== prevSecondsRef.current && seconds <= 5 && seconds > 0) {
      prevSecondsRef.current = seconds;
      if (seconds <= 3) { playTimerUrgent(); } else { playTimerTick(); }
    }
  }, [bossTimeRemainingMs, phase, playTimerTick, playTimerUrgent]);

  // Phase change sounds
  const prevPhaseRef = useRef(phase);
  useEffect(() => {
    if (prevPhaseRef.current === phase) return;
    prevPhaseRef.current = phase;
    if (phase === 'boss_incoming') playBossIncoming();
    if (phase === 'boss_defeated') playBossDefeated();
    if (phase === 'game_over') {
      playGameOver();
      const s = calculateStats();
      onUpdateStats(s);
      setTimeout(() => setShowResults(true), 600);
    }
  }, [phase, playBossIncoming, playBossDefeated, playGameOver, calculateStats, onUpdateStats]);

  const handleSubmit = useCallback((answer: number) => {
    if (phase !== 'playing' && phase !== 'boss_active') return;
    const submitResult = submitAnswer(answer);
    if (!submitResult) return;
    const { result, gameOver, reason } = submitResult;
    setFeedbackState(result.isCorrect ? 'correct' : 'wrong');
    if (result.isCorrect) { playCorrect(); } else { playWrong(); }
    if (gameOver) {
      setTimeout(() => { triggerGameOver(reason || 'wrong_answer'); setFeedbackState('idle'); }, 400);
    } else {
      setTimeout(() => { setDisplayedQuestion(currentQuestionRef.current); setFeedbackState('idle'); }, ANIMATION_DURATION);
    }
  }, [phase, submitAnswer, triggerGameOver, playCorrect, playWrong]);

  const handleStartGame = useCallback(() => {
    setShowResults(false); setDisplayedQuestion(null); setFeedbackState('idle');
    startGame();
  }, [startGame]);

  const handleEndGame = useCallback(() => {
    endGame();
  }, [endGame]);

  const handleRestart = useCallback(() => {
    setShowResults(false); setDisplayedQuestion(null); setFeedbackState('idle');
    resetGame();
    setTimeout(() => startGame(), 50);
  }, [resetGame, startGame]);

  const handleCloseResults = useCallback(() => {
    setShowResults(false); setDisplayedQuestion(null); setFeedbackState('idle');
    resetGame();
  }, [resetGame]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase === 'idle' && e.key === 'Enter') handleStartGame();
      if (state.isPlaying && e.key === 'Escape') handleEndGame();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, state.isPlaying, handleStartGame, handleEndGame]);

  const operationIndex = state.results.length;
  const bossProgress = operationIndex % 5;
  const currentBossNumber = state.bossesDefeated + 1;
  const stats = calculateStats();
  const hasEnabledOperation = (Object.keys(settings.operations) as Array<keyof typeof settings.operations>).some(op => settings.operations[op].enabled);

  // IDLE / START SCREEN
  if (phase === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
        <div className="flex flex-col items-center gap-4">
          <div className="text-6xl animate-boss-skull">💀</div>
          <h2 className="text-3xl font-bold text-highlight tracking-tight">
            Boss <span className="text-destructive">Hunter</span>
          </h2>
          <div className="text-sm text-ghost text-center max-w-sm space-y-1">
            <p>Dificuldade progressiva. Sem margem de erro.</p>
            <p>A cada 5 operações, enfrente um <span className="text-destructive font-medium">Boss</span> com 15s para responder.</p>
            <p>Até onde você chega?</p>
          </div>
        </div>
        <Button onClick={handleStartGame} disabled={!hasEnabledOperation} size="lg" className="text-lg px-8 py-6 bg-destructive text-destructive-foreground hover:bg-destructive/90">
          <Swords className="w-5 h-5 mr-2" />
          Iniciar Caçada
        </Button>
        <div className="flex items-center gap-2 text-ghost text-sm">
          <Keyboard className="w-4 h-4" />
          <span>ou pressione Enter</span>
        </div>
        {bestRun > 0 && (
          <div className="flex flex-col items-center gap-1 text-sm text-ghost">
            <span>🏆 Melhor run: <span className="text-highlight font-medium">{bestRun}</span> operações</span>
            <span>💀 Bosses caçados: <span className="text-highlight font-medium">{bestBosses}</span></span>
          </div>
        )}
        <BossHunterResults open={showResults} onClose={handleCloseResults} onRestart={handleRestart} stats={stats} results={state.results} gameOverReason={state.gameOverReason} bestRun={bestRun} bestBosses={bestBosses} />
      </div>
    );
  }

  // GAMEPLAY
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 relative">
      {/* Boss Incoming Overlay */}
      <BossIncoming show={phase === 'boss_incoming'} bossNumber={currentBossNumber} />

      {/* Boss Defeated Overlay */}
      {phase === 'boss_defeated' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-3 animate-boss-defeated">
            <Shield className="w-16 h-16 text-success" />
            <h2 className="text-2xl md:text-3xl font-bold text-success glow-success">
              Boss #{state.bossesDefeated} Derrotado! 🎉
            </h2>
          </div>
        </div>
      )}

      {/* Top Stats */}
      <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 text-dim">
        <div className="flex flex-col items-center">
          <span className="text-xs uppercase tracking-wider text-ghost">operação</span>
          <span className="text-xl font-bold text-highlight">#{operationIndex + 1}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs uppercase tracking-wider text-ghost">bosses</span>
          <span className="text-xl font-bold text-highlight flex items-center gap-1">💀 {state.bossesDefeated}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs uppercase tracking-wider text-ghost">opm</span>
          <span className="text-xl font-bold text-highlight">{Math.round(stats.opm)}</span>
        </div>
      </div>

      {/* Boss Progress Bar */}
      {phase === 'playing' && (
        <div className="w-full max-w-xs">
          <div className="flex items-center justify-between text-xs text-ghost mb-1">
            <span>Próximo Boss</span>
            <span>{bossProgress}/5</span>
          </div>
          <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(bossProgress / 5) * 100}%`, background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--destructive)))' }} />
          </div>
        </div>
      )}

      {/* Boss Active */}
      {phase === 'boss_active' && (
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-destructive font-bold text-lg">
            <Skull className="w-6 h-6 boss-glow" />
            <span className="boss-text-glow">BOSS #{currentBossNumber}</span>
            <Skull className="w-6 h-6 boss-glow" />
          </div>
          <BossTimer timeRemainingMs={bossTimeRemainingMs} totalTimeMs={15000} />
        </div>
      )}

      {/* Question + Input */}
      <div className={cn("flex flex-col items-center gap-8 py-4", phase === 'boss_active' && "boss-border rounded-xl p-6")}>
        {displayedQuestion && phase !== 'boss_incoming' && (
          <QuestionDisplay question={displayedQuestion} feedbackState={feedbackState} />
        )}
        <AnswerInput onSubmit={handleSubmit} feedbackState={feedbackState} onKeyPress={playKeypress} disabled={phase === 'boss_incoming' || phase === 'boss_defeated' || phase === 'game_over'} />
      </div>

      {/* End Button */}
      {phase !== 'game_over' && (
        <Button onClick={handleEndGame} variant="ghost" className="text-muted-foreground hover:text-highlight">
          <Square className="w-4 h-4 mr-2" />
          Encerrar (Esc)
        </Button>
      )}

      {/* Results */}
      <BossHunterResults open={showResults} onClose={handleCloseResults} onRestart={handleRestart} stats={stats} results={state.results} gameOverReason={state.gameOverReason} bestRun={bestRun} bestBosses={bestBosses} />
    </div>
  );
}

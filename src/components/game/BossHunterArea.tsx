import { useState, useCallback, useEffect, useRef } from 'react';
import { QuestionDisplay } from './QuestionDisplay';
import { AnswerInput } from './AnswerInput';
import { BossTimer } from './BossTimer';
import { BossIncoming } from './BossIncoming';
import { BossHunterResults } from './BossHunterResults';
import { useBossHunterState } from '@/hooks/useBossHunterState';
import { useGameSounds } from '@/hooks/useSound';
import { GameSettings, Question, BossHunterStats, QuestionResult } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Swords, Square, Shield, Keyboard } from 'lucide-react';
import { BossIcon } from '@/components/ui/BossIcon';
import { cn } from '@/lib/utils';

import { BossDefeatedOverlay } from './BossDefeatedOverlay';

interface BossHunterAreaProps {
  settings: GameSettings;
  onUpdateStats: (stats: BossHunterStats, results?: QuestionResult[]) => void;
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
  const [previewDefeated, setPreviewDefeated] = useState(false);

  const handleTestDefeated = useCallback(() => {
    playBossDefeated();
    setPreviewDefeated(true);
    setTimeout(() => {
      setPreviewDefeated(false);
    }, 2000);
  }, [playBossDefeated]);

  const currentQuestionRef = useRef<Question | null>(null);
  useEffect(() => { currentQuestionRef.current = state.currentQuestion; }, [state.currentQuestion]);

  // Sync displayed question on game start
  useEffect(() => {
    if (state.isPlaying && state.currentQuestion && !displayedQuestion) {
      setDisplayedQuestion(state.currentQuestion);
    }
  }, [state.sessionStartTime]);

  // When phase changes to boss_active, sync the displayed question to the
  // boss question that the hook just placed in state
  useEffect(() => {
    if (phase === 'boss_active' && state.currentQuestion) {
      setDisplayedQuestion(state.currentQuestion);
      setFeedbackState('idle');
    }
  }, [phase]);

  // When phase returns to 'playing' after boss_defeated (next normal op),
  // sync the displayed question
  const prevPhaseForQuestionRef = useRef(phase);
  useEffect(() => {
    const prev = prevPhaseForQuestionRef.current;
    prevPhaseForQuestionRef.current = phase;
    if (phase === 'playing' && prev === 'boss_defeated' && state.currentQuestion) {
      setDisplayedQuestion(state.currentQuestion);
      setFeedbackState('idle');
    }
  }, [phase, state.currentQuestion]);

  // Boss timer sounds (suave nos segundos 3, 2, 1)
  const prevSecondsRef = useRef(16);
  useEffect(() => {
    if (phase !== 'boss_active') { prevSecondsRef.current = 16; return; }
    const seconds = Math.ceil(bossTimeRemainingMs / 1000);
    if (seconds !== prevSecondsRef.current) {
      prevSecondsRef.current = seconds;
      if (seconds <= 3 && seconds >= 1) {
        playTimerTick();
      }
    }
  }, [bossTimeRemainingMs, phase, playTimerTick]);

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
      onUpdateStats(s, state.results);
      setTimeout(() => setShowResults(true), 600);
    }
  }, [phase, playBossIncoming, playBossDefeated, playGameOver, calculateStats, onUpdateStats, state.results]);

  const handleSubmit = useCallback((answer: number) => {
    // Only allow input during playing or boss_active
    if (phase !== 'playing' && phase !== 'boss_active') return;
    const submitResult = submitAnswer(answer);
    if (!submitResult) return;
    const { result, gameOver, reason } = submitResult;

    setFeedbackState(result.isCorrect ? 'correct' : 'wrong');
    if (result.isCorrect) { playCorrect(); } else { playWrong(); }

    if (gameOver) {
      // Wrong answer → game over after brief flash
      setTimeout(() => { triggerGameOver(reason || 'wrong_answer'); setFeedbackState('idle'); }, 400);
    } else {
      // Correct answer — after a brief feedback animation, update the displayed question.
      // If the hook moved us to pre_boss or boss_defeated, the question+input area
      // will be hidden by the render (showQuestionAndInput is false), so updating
      // displayedQuestion here is harmless and ensures it's ready for the next
      // time it becomes visible.
      setTimeout(() => {
        setDisplayedQuestion(currentQuestionRef.current);
        setFeedbackState('idle');
      }, ANIMATION_DURATION);
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
      if (e.shiftKey && (e.key === 'B' || e.key === 'b')) handleTestDefeated();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, state.isPlaying, handleStartGame, handleEndGame, handleTestDefeated]);

  const operationIndex = state.results.length;
  const bossProgress = operationIndex % 5;
  const currentBossNumber = state.bossesDefeated + 1;
  const stats = calculateStats();
  const hasEnabledOperation = (Object.keys(settings.operations) as Array<keyof typeof settings.operations>).some(op => settings.operations[op].enabled);

  // Determine if question/input should be visible
  const showQuestionAndInput = phase === 'playing' || phase === 'boss_active';

  // IDLE / START SCREEN
  if (phase === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
        <div className="flex flex-col items-center gap-4">
          <BossIcon className="w-20 h-20 text-destructive boss-glow animate-boss-skull" />
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
        {bestBosses > 0 && (
          <div className="flex flex-col items-center gap-1 text-sm text-ghost">
            <span className="flex items-center gap-1"><BossIcon className="w-4 h-4 text-destructive inline" /> Bosses caçados (recorde): <span className="text-highlight font-medium">{bestBosses}</span></span>
          </div>
        )}

        {previewDefeated && <BossDefeatedOverlay bossNumber={1} />}

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
      {(phase === 'boss_defeated' || previewDefeated) && (
        <BossDefeatedOverlay bossNumber={state.bossesDefeated || 1} />
      )}

      {/* Pre-Boss Breathing Room */}
      {phase === 'pre_boss' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 animate-in fade-in-0 zoom-in-95 duration-300">
            <p className="text-lg text-ghost">Preparando para o Boss...</p>
            <div className="flex items-center gap-2 text-destructive animate-pulse">
              <span className="font-bold text-xl boss-text-glow">BOSS #{currentBossNumber}</span>
            </div>
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
          <span className="text-xl font-bold text-highlight flex items-center gap-1.5"><BossIcon className="w-5 h-5 text-destructive" /> {state.bossesDefeated}</span>
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
            <div className="h-full rounded-full transition-all duration-300 bg-destructive" style={{ width: `${(bossProgress / 5) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Boss Active Header */}
      {phase === 'boss_active' && (
        <div className="flex flex-col items-center gap-2">
          <span className="boss-text-glow font-extrabold text-2xl tracking-wider text-destructive">
            BOSS #{currentBossNumber}
          </span>
          <div className="relative flex items-center justify-center py-2">
            <BossIcon className="w-16 h-16 text-destructive animate-boss-alive" />
          </div>
        </div>
      )}

      {/* Question + Input — only visible during playing and boss_active */}
      {showQuestionAndInput && (
        <div className={cn("flex flex-col items-center gap-6 py-4", phase === 'boss_active' && "rounded-xl p-6")}>
          {displayedQuestion && (
            <QuestionDisplay question={displayedQuestion} feedbackState={feedbackState} operationClassName="text-destructive" />
          )}
          <AnswerInput onSubmit={handleSubmit} feedbackState={feedbackState} onKeyPress={playKeypress} isBossMode disabled={false} />

          {/* Horizontal Countdown Bar below input during boss fight */}
          {phase === 'boss_active' && (
            <BossTimer timeRemainingMs={bossTimeRemainingMs} totalTimeMs={15000} />
          )}
        </div>
      )}

      {/* End Button */}
      {phase !== 'game_over' && (
        <Button onClick={handleEndGame} variant="ghost" className="text-muted-foreground hover: hover:bg-destructive transition-colors duration-200">
          <Square className="w-4 h-4 mr-2" />
          Encerrar (Esc)
        </Button>
      )}

      {/* Results */}
      <BossHunterResults open={showResults} onClose={handleCloseResults} onRestart={handleRestart} stats={stats} results={state.results} gameOverReason={state.gameOverReason} bestRun={bestRun} bestBosses={bestBosses} />
    </div>
  );
}

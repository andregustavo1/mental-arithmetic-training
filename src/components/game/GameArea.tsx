import { useState, useCallback, useEffect } from 'react';
import { QuestionDisplay } from './QuestionDisplay';
import { AnswerInput } from './AnswerInput';
import { StatsBar } from './StatsBar';
import { FeedbackMessage } from './FeedbackMessage';
import { ResultsModal } from './ResultsModal';
import { useGameState } from '@/hooks/useGameState';
import { useGameSounds } from '@/hooks/useSound';
import { GameSettings, OperationType } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Play, Square, Keyboard } from 'lucide-react';
interface GameAreaProps {
  settings: GameSettings;
  onUpdateStats: (correct: number, total: number, bestStreak: number, opm: number) => void;
  allTimeBestStreak: number;
  allTimeBestOpm: number;
}
export function GameArea({
  settings,
  onUpdateStats,
  allTimeBestStreak,
  allTimeBestOpm
}: GameAreaProps) {
  const {
    state,
    startGame,
    submitAnswer,
    endGame,
    resetGame,
    calculateStats
  } = useGameState(settings);
  const {
    playCorrect,
    playWrong,
    playStreak,
    playKeypress
  } = useGameSounds(settings.soundEnabled);
  const [feedbackState, setFeedbackState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [lastResult, setLastResult] = useState<{
    isCorrect: boolean;
    answer: number;
  } | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [streakAnimate, setStreakAnimate] = useState(false);
  const hasEnabledOperation = (Object.keys(settings.operations) as OperationType[]).some(op => settings.operations[op].enabled);
  const handleSubmit = useCallback((answer: number) => {
    const result = submitAnswer(answer);
    if (!result) return;
    setLastResult({
      isCorrect: result.isCorrect,
      answer: result.question.answer
    });
    setFeedbackState(result.isCorrect ? 'correct' : 'wrong');
    setShowFeedback(true);
    if (result.isCorrect) {
      playCorrect();
      const newStreak = state.streak + 1;
      if (newStreak % 5 === 0 && newStreak > 0) {
        playStreak(newStreak);
      }
      setStreakAnimate(true);
      setTimeout(() => setStreakAnimate(false), 300);
    } else {
      playWrong();
    }

    // Reset feedback after animation
    setTimeout(() => {
      setFeedbackState('idle');
      setShowFeedback(false);
    }, 800);
  }, [submitAnswer, playCorrect, playWrong, playStreak, state.streak]);
  const handleEndGame = useCallback(() => {
    const stats = calculateStats();
    onUpdateStats(stats.correctAnswers, stats.totalQuestions, stats.bestStreak, stats.opm);
    endGame();
    setShowResults(true);
  }, [calculateStats, onUpdateStats, endGame]);
  const handleRestart = useCallback(() => {
    setShowResults(false);
    resetGame();
    startGame();
  }, [resetGame, startGame]);
  const handleCloseResults = useCallback(() => {
    setShowResults(false);
    resetGame();
  }, [resetGame]);

  // Keyboard shortcut to start
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!state.isPlaying && e.key === 'Enter' && hasEnabledOperation) {
        startGame();
      }
      if (state.isPlaying && e.key === 'Escape') {
        handleEndGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.isPlaying, startGame, handleEndGame, hasEnabledOperation]);
  const stats = calculateStats();
  if (!state.isPlaying) {
    return <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
        

        <Button onClick={startGame} disabled={!hasEnabledOperation} size="lg" className="text-lg px-8 py-6 bg-primary text-primary-foreground hover:bg-primary/90">
          <Play className="w-5 h-5 mr-2" />
          Começar
        </Button>

        <div className="flex items-center gap-2 text-ghost text-sm">
          <Keyboard className="w-4 h-4" />
          <span>ou pressione Enter</span>
        </div>

        <ResultsModal open={showResults} onClose={handleCloseResults} onRestart={handleRestart} stats={stats} results={state.results} allTimeBestStreak={allTimeBestStreak} allTimeBestOpm={allTimeBestOpm} />
      </div>;
  }
  return <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      {/* Stats Bar */}
      <StatsBar score={state.score} streak={state.streak} totalQuestions={state.results.length} averageTimeMs={stats.averageTimeMs} opm={stats.opm} streakAnimate={streakAnimate} />

      {/* Question Display */}
      <div className="flex flex-col items-center gap-8 py-12">
        {state.currentQuestion && <QuestionDisplay question={state.currentQuestion} feedbackState={feedbackState} />}

        <AnswerInput onSubmit={handleSubmit} feedbackState={feedbackState} onKeyPress={playKeypress} />
      </div>

      {/* Feedback Message */}
      <div className="h-16 flex items-center justify-center">
        <FeedbackMessage isCorrect={lastResult?.isCorrect ?? true} correctAnswer={lastResult?.answer} show={showFeedback} />
      </div>

      {/* End Game Button */}
      <Button onClick={handleEndGame} variant="ghost" className="text-muted-foreground hover:text-highlight">
        <Square className="w-4 h-4 mr-2" />
        Encerrar (Esc)
      </Button>
    </div>;
}
import { useState, useCallback, useEffect } from 'react';
import { QuestionDisplay } from './QuestionDisplay';
import { AnswerInput } from './AnswerInput';
import { StatsBar } from './StatsBar';
import { HistoryPanel } from './HistoryPanel';
import { ResultsModal } from './ResultsModal';
import { StreakDisplay } from './StreakDisplay';
import { useGameState } from '@/hooks/useGameState';
import { useGameSounds } from '@/hooks/useSound';
import { GameSettings, OperationType, Question, GameStats } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Play, Square, Keyboard } from 'lucide-react';

const ANIMATION_DURATION = 500; // ms for color animation

interface GameAreaProps {
  settings: GameSettings;
  onUpdateStats: (correct: number, total: number, bestStreak: number, opm: number, stats: GameStats) => void;
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
  const [displayedQuestion, setDisplayedQuestion] = useState<Question | null>(null);
  const [displayedStreak, setDisplayedStreak] = useState(0);
  
  const hasEnabledOperation = (Object.keys(settings.operations) as OperationType[]).some(op => settings.operations[op].enabled);

  // Initialize displayed question when game starts
  useEffect(() => {
    if (state.isPlaying && state.currentQuestion && !displayedQuestion) {
      setDisplayedQuestion(state.currentQuestion);
      setDisplayedStreak(state.streak);
    }
  }, [state.isPlaying, state.currentQuestion, displayedQuestion, state.streak]);

  const handleSubmit = useCallback((answer: number) => {
    const submitResult = submitAnswer(answer);
    if (!submitResult) return;
    
    const { result, nextQuestion } = submitResult;
    
    setLastResult({
      isCorrect: result.isCorrect,
      answer: result.question.answer
    });
    setFeedbackState(result.isCorrect ? 'correct' : 'wrong');
    setShowFeedback(true);
    
    const newStreak = result.isCorrect ? state.streak + 1 : 0;
    
    if (result.isCorrect) {
      playCorrect();
      if (newStreak % 5 === 0 && newStreak > 0) {
        playStreak(newStreak);
      }
      setStreakAnimate(true);
      setTimeout(() => setStreakAnimate(false), 300);
    } else {
      playWrong();
    }

    // Update displayed question and streak after animation completes
    // nextQuestion comes directly from submitAnswer, avoiding stale closure issues
    setTimeout(() => {
      setDisplayedQuestion(nextQuestion);
      setDisplayedStreak(newStreak);
      setFeedbackState('idle');
      setShowFeedback(false);
    }, ANIMATION_DURATION);
  }, [submitAnswer, playCorrect, playWrong, playStreak, state.streak]);
  const handleEndGame = useCallback(() => {
    const stats = calculateStats();
    onUpdateStats(stats.correctAnswers, stats.totalQuestions, stats.bestStreak, stats.opm, stats);
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
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      {/* Stats Bar */}
      <StatsBar 
        totalQuestions={state.results.length} 
        opm={stats.opm}
        correctAnswers={state.score}
      />

      {/* Question Display */}
      <div className="flex flex-col items-center gap-8 py-8">
        {displayedQuestion && (
          <QuestionDisplay question={displayedQuestion} feedbackState={feedbackState} />
        )}

        <AnswerInput onSubmit={handleSubmit} feedbackState={feedbackState} onKeyPress={playKeypress} />
        
        {/* Streak Display - centered below answer */}
        <div className="flex flex-col items-center mt-4">
          <span className="text-xs uppercase tracking-wider text-ghost mb-1">streak</span>
          <StreakDisplay streak={displayedStreak} animate={streakAnimate} />
        </div>
      </div>

      {/* History Panel */}
      {state.results.length > 0 && (
        <div className="w-full max-w-md">
          <HistoryPanel results={state.results} />
        </div>
      )}

      {/* End Game Button */}
      <Button onClick={handleEndGame} variant="ghost" className="text-muted-foreground hover:text-highlight">
        <Square className="w-4 h-4 mr-2" />
        Encerrar (Esc)
      </Button>
    </div>
  );
}
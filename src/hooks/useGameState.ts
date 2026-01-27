import { useState, useCallback, useRef } from 'react';
import { GameState, GameSettings, Question, QuestionResult, OperationType, GameStats } from '@/types/game';

const OPERATION_SYMBOLS: Record<OperationType, string> = {
  addition: '+',
  subtraction: '−',
  multiplication: '×',
  division: '÷',
};

function generateQuestion(settings: GameSettings): Question | null {
  const enabledOps = (Object.keys(settings.operations) as OperationType[])
    .filter(op => settings.operations[op].enabled);
  
  if (enabledOps.length === 0) return null;
  
  const operation = enabledOps[Math.floor(Math.random() * enabledOps.length)];
  const config = settings.operations[operation];
  
  let x1: number, x2: number, answer: number;
  
  if (operation === 'division') {
    // For division, generate answer first to ensure clean division
    const tempX2 = Math.floor(Math.random() * (config.x2Max - config.x2Min + 1)) + config.x2Min;
    const maxAnswer = Math.floor(config.x1Max / tempX2);
    const minAnswer = Math.ceil(config.x1Min / tempX2);
    
    if (minAnswer > maxAnswer || maxAnswer < 1) {
      // Fallback to simple division
      x2 = tempX2;
      answer = Math.floor(Math.random() * 10) + 1;
      x1 = x2 * answer;
    } else {
      answer = Math.floor(Math.random() * (maxAnswer - minAnswer + 1)) + minAnswer;
      x2 = tempX2;
      x1 = x2 * answer;
    }
  } else {
    x1 = Math.floor(Math.random() * (config.x1Max - config.x1Min + 1)) + config.x1Min;
    x2 = Math.floor(Math.random() * (config.x2Max - config.x2Min + 1)) + config.x2Min;
    
    switch (operation) {
      case 'addition':
        answer = x1 + x2;
        break;
      case 'subtraction':
        // Ensure positive result
        if (x2 > x1) [x1, x2] = [x2, x1];
        answer = x1 - x2;
        break;
      case 'multiplication':
        answer = x1 * x2;
        break;
      default:
        answer = 0;
    }
  }
  
  return {
    x1,
    x2,
    operation,
    answer,
    displayOperation: OPERATION_SYMBOLS[operation],
  };
}

const initialState: GameState = {
  isPlaying: false,
  currentQuestion: null,
  score: 0,
  streak: 0,
  bestStreak: 0,
  results: [],
  sessionStartTime: null,
  questionStartTime: null,
};

export function useGameState(settings: GameSettings) {
  const [state, setState] = useState<GameState>(initialState);
  const questionStartRef = useRef<number | null>(null);

  const startGame = useCallback(() => {
    const question = generateQuestion(settings);
    if (!question) return;
    
    const now = Date.now();
    questionStartRef.current = now;
    
    setState({
      isPlaying: true,
      currentQuestion: question,
      score: 0,
      streak: 0,
      bestStreak: 0,
      results: [],
      sessionStartTime: now,
      questionStartTime: now,
    });
  }, [settings]);

  const submitAnswer = useCallback((userAnswer: number): QuestionResult | null => {
    if (!state.currentQuestion || questionStartRef.current === null) return null;
    
    const now = Date.now();
    const timeMs = now - questionStartRef.current;
    const isCorrect = userAnswer === state.currentQuestion.answer;
    
    const result: QuestionResult = {
      question: state.currentQuestion,
      userAnswer,
      isCorrect,
      timeMs,
      timestamp: now,
    };
    
    const newStreak = isCorrect ? state.streak + 1 : 0;
    const newBestStreak = Math.max(state.bestStreak, newStreak);
    
    // Generate next question
    const nextQuestion = generateQuestion(settings);
    questionStartRef.current = Date.now();
    
    setState(prev => ({
      ...prev,
      currentQuestion: nextQuestion,
      score: isCorrect ? prev.score + 1 : prev.score,
      streak: newStreak,
      bestStreak: newBestStreak,
      results: [...prev.results, result],
      questionStartTime: Date.now(),
    }));
    
    return result;
  }, [state, settings]);

  const endGame = useCallback(() => {
    setState(prev => ({
      ...prev,
      isPlaying: false,
    }));
  }, []);

  const resetGame = useCallback(() => {
    questionStartRef.current = null;
    setState(initialState);
  }, []);

  const calculateStats = useCallback((): GameStats => {
    const { results, sessionStartTime, bestStreak } = state;
    
    if (results.length === 0 || !sessionStartTime) {
      return {
        totalQuestions: 0,
        correctAnswers: 0,
        accuracy: 0,
        opm: 0,
        averageTimeMs: 0,
        bestStreak: 0,
        sessionDurationMs: 0,
      };
    }
    
    const correctAnswers = results.filter(r => r.isCorrect).length;
    const sessionDurationMs = Date.now() - sessionStartTime;
    const sessionMinutes = sessionDurationMs / 60000;
    
    return {
      totalQuestions: results.length,
      correctAnswers,
      accuracy: (correctAnswers / results.length) * 100,
      opm: sessionMinutes > 0 ? results.length / sessionMinutes : 0,
      averageTimeMs: results.reduce((sum, r) => sum + r.timeMs, 0) / results.length,
      bestStreak,
      sessionDurationMs,
    };
  }, [state]);

  return {
    state,
    startGame,
    submitAnswer,
    endGame,
    resetGame,
    calculateStats,
  };
}

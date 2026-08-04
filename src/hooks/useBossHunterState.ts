import { useState, useCallback, useRef, useEffect } from 'react';
import {
  BossHunterGameState,
  BossHunterPhase,
  BossHunterStats,
  GameSettings,
  Question,
  QuestionResult,
  OperationType,
  getBossHunterTitle,
} from '@/types/game';

const BOSS_TIME_LIMIT = 15000;

const OPERATION_SYMBOLS: Record<OperationType, string> = {
  addition: '+',
  subtraction: '\u2212',
  multiplication: '\u00d7',
  division: '\u00f7',
};

function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getEnabledOps(settings: GameSettings): OperationType[] {
  return (Object.keys(settings.operations) as OperationType[])
    .filter(op => settings.operations[op].enabled);
}

function generateBossHunterQuestion(operationIndex: number, enabledOps: OperationType[]): Question | null {
  if (enabledOps.length === 0) return null;

  const operation = enabledOps[Math.floor(Math.random() * enabledOps.length)];
  const scale = operationIndex * 0.12;

  let x1: number, x2: number, answer: number;

  switch (operation) {
    case 'addition': {
      const minX1 = 1 + Math.floor(scale * 4);
      const maxX1 = 9 + Math.floor(scale * 12);
      const minX2 = 1 + Math.floor(scale * 3);
      const maxX2 = 9 + Math.floor(scale * 8);
      x1 = randomInRange(minX1, maxX1);
      x2 = randomInRange(minX2, maxX2);
      answer = x1 + x2;
      break;
    }
    case 'subtraction': {
      const minX1 = 2 + Math.floor(scale * 4);
      const maxX1 = 15 + Math.floor(scale * 12);
      const minX2 = 1 + Math.floor(scale * 3);
      const maxX2 = 9 + Math.floor(scale * 8);
      x1 = randomInRange(minX1, maxX1);
      x2 = randomInRange(minX2, Math.min(maxX2, x1));
      if (x2 > x1) [x1, x2] = [x2, x1];
      answer = x1 - x2;
      break;
    }
    case 'multiplication': {
      const minX1 = 2 + Math.floor(scale * 1.5);
      const maxX1 = 9 + Math.floor(scale * 4);
      const minX2 = 2;
      const maxX2 = 5 + Math.floor(scale * 1.5);
      x1 = randomInRange(minX1, maxX1);
      x2 = randomInRange(minX2, maxX2);
      answer = x1 * x2;
      break;
    }
    case 'division': {
      const minDivisor = 2;
      const maxDivisor = 5 + Math.floor(scale * 1.5);
      const minAnswer = 2 + Math.floor(scale * 1);
      const maxAnswer = 9 + Math.floor(scale * 3);
      x2 = randomInRange(minDivisor, maxDivisor);
      answer = randomInRange(minAnswer, maxAnswer);
      x1 = x2 * answer;
      break;
    }
    default:
      x1 = 1; x2 = 1; answer = 2;
  }

  return { x1, x2, operation, answer, displayOperation: OPERATION_SYMBOLS[operation] };
}

export function isBossOperation(index: number): boolean {
  return index > 0 && (index + 1) % 5 === 0;
}

const initialState: BossHunterGameState = {
  isPlaying: false,
  currentQuestion: null,
  results: [],
  bossesDefeated: 0,
  sessionStartTime: null,
  gameOverReason: undefined,
};

export function useBossHunterState(settings: GameSettings) {
  const [state, setState] = useState<BossHunterGameState>(initialState);
  const [phase, setPhase] = useState<BossHunterPhase>('idle');
  const [bossTimeRemainingMs, setBossTimeRemainingMs] = useState(BOSS_TIME_LIMIT);

  const questionStartRef = useRef<number | null>(null);
  const bossTimerRef = useRef<number | null>(null);
  const phaseRef = useRef<BossHunterPhase>('idle');

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const clearBossTimer = useCallback(() => {
    if (bossTimerRef.current) {
      clearInterval(bossTimerRef.current);
      bossTimerRef.current = null;
    }
  }, []);

  const triggerGameOver = useCallback((reason: 'wrong_answer' | 'timeout') => {
    clearBossTimer();
    setState(prev => ({ ...prev, isPlaying: false, gameOverReason: reason }));
    setPhase('game_over');
  }, [clearBossTimer]);

  const triggerGameOverRef = useRef(triggerGameOver);
  useEffect(() => { triggerGameOverRef.current = triggerGameOver; }, [triggerGameOver]);

  const startBossTimer = useCallback(() => {
    clearBossTimer();
    const deadline = Date.now() + BOSS_TIME_LIMIT;
    setBossTimeRemainingMs(BOSS_TIME_LIMIT);
    bossTimerRef.current = window.setInterval(() => {
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        clearInterval(bossTimerRef.current!);
        bossTimerRef.current = null;
        setBossTimeRemainingMs(0);
        triggerGameOverRef.current('timeout');
      } else {
        setBossTimeRemainingMs(remaining);
      }
    }, 50);
  }, [clearBossTimer]);

  useEffect(() => {
    return () => { if (bossTimerRef.current) clearInterval(bossTimerRef.current); };
  }, []);

  const startGame = useCallback(() => {
    const enabledOps = getEnabledOps(settings);
    const question = generateBossHunterQuestion(0, enabledOps);
    if (!question) return;
    const now = Date.now();
    questionStartRef.current = now;
    setState({
      isPlaying: true,
      currentQuestion: question,
      results: [],
      bossesDefeated: 0,
      sessionStartTime: now,
      gameOverReason: undefined,
    });
    setPhase('playing');
  }, [settings]);

  const submitAnswer = useCallback((userAnswer: number): {
    result: QuestionResult;
    gameOver: boolean;
    reason?: 'wrong_answer';
    bossDefeated: boolean;
  } | null => {
    if (!state.currentQuestion) return null;
    if (phaseRef.current !== 'playing' && phaseRef.current !== 'boss_active') return null;

    const now = Date.now();
    const timeMs = now - (questionStartRef.current || now);
    const isCorrect = userAnswer === state.currentQuestion.answer;
    const currentOpIndex = state.results.length;
    const currentIsBoss = isBossOperation(currentOpIndex);

    const result: QuestionResult = {
      question: state.currentQuestion,
      userAnswer,
      isCorrect,
      timeMs,
      timestamp: now,
    };

    if (!isCorrect) {
      if (currentIsBoss) clearBossTimer();
      setState(prev => ({ ...prev, results: [...prev.results, result] }));
      return { result, gameOver: true, reason: 'wrong_answer', bossDefeated: false };
    }

    const newResults = [...state.results, result];
    const nextOpIndex = newResults.length;
    const nextIsBoss = isBossOperation(nextOpIndex);
    const newBossesDefeated = currentIsBoss ? state.bossesDefeated + 1 : state.bossesDefeated;
    const enabledOps = getEnabledOps(settings);
    const nextQuestion = generateBossHunterQuestion(nextOpIndex, enabledOps);

    if (currentIsBoss) clearBossTimer();

    setState(prev => ({
      ...prev,
      currentQuestion: nextQuestion,
      results: newResults,
      bossesDefeated: newBossesDefeated,
    }));

    if (currentIsBoss) {
      setPhase('boss_defeated');
      setTimeout(() => {
        if (nextIsBoss) {
          setPhase('boss_incoming');
          setTimeout(() => {
            setPhase('boss_active');
            startBossTimer();
            questionStartRef.current = Date.now();
          }, 1500);
        } else {
          setPhase('playing');
          questionStartRef.current = Date.now();
        }
      }, 1200);
    } else if (nextIsBoss) {
      setPhase('boss_incoming');
      setTimeout(() => {
        setPhase('boss_active');
        startBossTimer();
        questionStartRef.current = Date.now();
      }, 1500);
    } else {
      questionStartRef.current = Date.now();
    }

    return { result, gameOver: false, bossDefeated: currentIsBoss };
  }, [state, settings, clearBossTimer, startBossTimer]);

  const endGame = useCallback(() => {
    clearBossTimer();
    setState(prev => ({ ...prev, isPlaying: false }));
    setPhase('game_over');
  }, [clearBossTimer]);

  const resetGame = useCallback(() => {
    clearBossTimer();
    questionStartRef.current = null;
    setState(initialState);
    setPhase('idle');
  }, [clearBossTimer]);

  const calculateStats = useCallback((): BossHunterStats => {
    const { results, sessionStartTime, bossesDefeated } = state;
    if (results.length === 0 || !sessionStartTime) {
      return { totalOperations: 0, bossesDefeated: 0, sessionDurationMs: 0, opm: 0, averageTimeMs: 0, levelReached: 1, title: 'Novato' };
    }
    const sessionDurationMs = Date.now() - sessionStartTime;
    const sessionMinutes = sessionDurationMs / 60000;
    const { title, level } = getBossHunterTitle(results.length);
    return {
      totalOperations: results.length,
      bossesDefeated,
      sessionDurationMs,
      opm: sessionMinutes > 0 ? results.length / sessionMinutes : 0,
      averageTimeMs: results.reduce((sum, r) => sum + r.timeMs, 0) / results.length,
      levelReached: level,
      title,
    };
  }, [state]);

  return { state, phase, bossTimeRemainingMs, startGame, submitAnswer, endGame, resetGame, triggerGameOver, calculateStats };
}

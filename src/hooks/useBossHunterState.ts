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

// Timing constants for the boss transition sequence:
// After answering the last normal op before a boss:
//   0. Green feedback shows for FEEDBACK_DELAY_MS (matches component's ANIMATION_DURATION)
//   1. PRE_BOSS phase shows for PRE_BOSS_DURATION_MS (breathing room)
//   2. BOSS_INCOMING phase shows the dramatic "BOSS #N" overlay for BOSS_INCOMING_DURATION_MS
//   3. BOSS_ACTIVE phase starts the timer and shows the boss question
const FEEDBACK_DELAY_MS = 300;
const PRE_BOSS_DURATION_MS = 1000;
const BOSS_INCOMING_DURATION_MS = 1500;

// After defeating a boss:
const BOSS_DEFEATED_DURATION_MS = 1600;

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

  // Store all pending transition timeouts so we can cancel them on cleanup
  const transitionTimeoutsRef = useRef<number[]>([]);

  // Track the pre-generated next question for boss transitions
  const pendingBossQuestionRef = useRef<Question | null>(null);

  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const clearBossTimer = useCallback(() => {
    if (bossTimerRef.current) {
      clearInterval(bossTimerRef.current);
      bossTimerRef.current = null;
    }
  }, []);

  const clearTransitionTimeouts = useCallback(() => {
    transitionTimeoutsRef.current.forEach(id => clearTimeout(id));
    transitionTimeoutsRef.current = [];
  }, []);

  const addTimeout = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(() => {
      // Remove this timeout from the list once it fires
      transitionTimeoutsRef.current = transitionTimeoutsRef.current.filter(t => t !== id);
      fn();
    }, ms);
    transitionTimeoutsRef.current.push(id);
    return id;
  }, []);

  const triggerGameOver = useCallback((reason: 'wrong_answer' | 'timeout') => {
    clearBossTimer();
    clearTransitionTimeouts();
    setState(prev => ({ ...prev, isPlaying: false, gameOverReason: reason }));
    setPhase('game_over');
  }, [clearBossTimer, clearTransitionTimeouts]);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (bossTimerRef.current) clearInterval(bossTimerRef.current);
      clearTransitionTimeouts();
    };
  }, [clearTransitionTimeouts]);

  const startGame = useCallback(() => {
    clearTransitionTimeouts();
    clearBossTimer();
    pendingBossQuestionRef.current = null;
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
  }, [settings, clearTransitionTimeouts, clearBossTimer]);

  const submitAnswer = useCallback((userAnswer: number): {
    result: QuestionResult;
    gameOver: boolean;
    reason?: 'wrong_answer';
    bossDefeated: boolean;
  } | null => {
    if (!state.currentQuestion) return null;
    // Only accept input during playing or boss_active
    if (phaseRef.current !== 'playing' && phaseRef.current !== 'boss_active') return null;
    // Block input if a boss transition is already pending (feedback is showing)
    if (pendingBossQuestionRef.current !== null) return null;

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

    // --- WRONG ANSWER: game over ---
    if (!isCorrect) {
      if (currentIsBoss) clearBossTimer();
      setState(prev => ({ ...prev, results: [...prev.results, result] }));
      return { result, gameOver: true, reason: 'wrong_answer', bossDefeated: false };
    }

    // --- CORRECT ANSWER ---
    const newResults = [...state.results, result];
    const nextOpIndex = newResults.length;
    const nextIsBoss = isBossOperation(nextOpIndex);
    const newBossesDefeated = currentIsBoss ? state.bossesDefeated + 1 : state.bossesDefeated;
    const enabledOps = getEnabledOps(settings);
    const nextQuestion = generateBossHunterQuestion(nextOpIndex, enabledOps);

    if (currentIsBoss) clearBossTimer();

    // =========================================================
    // CASE 1: Current op was a boss — show "boss defeated" overlay
    // =========================================================
    if (currentIsBoss) {
      // Update results + bosses count, keep old question visible during defeat animation
      setState(prev => ({
        ...prev,
        results: newResults,
        bossesDefeated: newBossesDefeated,
      }));
      setPhase('boss_defeated');

      addTimeout(() => {
        if (nextIsBoss) {
          // Rare: two bosses in a row (would only happen if 5 changes)
          pendingBossQuestionRef.current = nextQuestion;
          setPhase('boss_incoming');
          addTimeout(() => {
            const bossQuestion = pendingBossQuestionRef.current;
            pendingBossQuestionRef.current = null;
            setState(prev => ({ ...prev, currentQuestion: bossQuestion }));
            setPhase('boss_active');
            startBossTimer();
            questionStartRef.current = Date.now();
          }, BOSS_INCOMING_DURATION_MS);
        } else {
          // Normal: continue to next regular question
          setState(prev => ({ ...prev, currentQuestion: nextQuestion }));
          setPhase('playing');
          questionStartRef.current = Date.now();
        }
      }, BOSS_DEFEATED_DURATION_MS);

      return { result, gameOver: false, bossDefeated: true };
    }

    // =========================================================
    // CASE 2: Next op IS a boss — enter the "breathing room" sequence
    // =========================================================
    if (nextIsBoss) {
      // Store the boss question for later — do NOT put it in state yet.
      // This also serves as a guard: submitAnswer will return null if this ref is set,
      // preventing double-submission during the feedback delay window.
      pendingBossQuestionRef.current = nextQuestion;

      // Update results only; keep currentQuestion as-is so the green feedback
      // shows on the answered question
      setState(prev => ({
        ...prev,
        results: newResults,
      }));

      // Keep phase as 'playing' for FEEDBACK_DELAY_MS so the component shows
      // the green correct feedback, then transition to pre_boss breathing room
      addTimeout(() => {
        setPhase('pre_boss');

        // After the breathing room, show the dramatic boss incoming overlay
        addTimeout(() => {
          setPhase('boss_incoming');

          // After the boss incoming animation, start the boss fight
          addTimeout(() => {
            const bossQuestion = pendingBossQuestionRef.current;
            pendingBossQuestionRef.current = null;
            setState(prev => ({
              ...prev,
              currentQuestion: bossQuestion,
            }));
            setPhase('boss_active');
            startBossTimer();
            questionStartRef.current = Date.now();
          }, BOSS_INCOMING_DURATION_MS);
        }, PRE_BOSS_DURATION_MS);
      }, FEEDBACK_DELAY_MS);

      return { result, gameOver: false, bossDefeated: false };
    }

    // =========================================================
    // CASE 3: Normal operation → next normal operation
    // =========================================================
    setState(prev => ({
      ...prev,
      currentQuestion: nextQuestion,
      results: newResults,
    }));
    questionStartRef.current = Date.now();

    return { result, gameOver: false, bossDefeated: false };
  }, [state, settings, clearBossTimer, startBossTimer, addTimeout]);

  const endGame = useCallback(() => {
    clearBossTimer();
    clearTransitionTimeouts();
    setState(prev => ({ ...prev, isPlaying: false }));
    setPhase('game_over');
  }, [clearBossTimer, clearTransitionTimeouts]);

  const resetGame = useCallback(() => {
    clearBossTimer();
    clearTransitionTimeouts();
    pendingBossQuestionRef.current = null;
    questionStartRef.current = null;
    setState(initialState);
    setPhase('idle');
  }, [clearBossTimer, clearTransitionTimeouts]);

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

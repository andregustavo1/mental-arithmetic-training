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
const NORMAL_TIME_LIMIT = 60000;

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

/**
 * Progressão de dificuldade exponencial para o Boss Hunter.
 *
 * Fórmula principal:
 *   scale = (index * 0.15) * (1 + index / 50)
 *
 * Isso produz uma curva que começa suave e acelera:
 *   index  1  → scale ≈  0.15
 *   index 10  → scale ≈  1.80
 *   index 20  → scale ≈  4.20
 *   index 40  → scale ≈ 10.80
 *   index 60  → scale ≈ 19.80
 *   index 80  → scale ≈ 31.20
 *
 * A lógica por operação foca em *carga cognitiva*, não apenas números maiores:
 *   Adição      → força "vai um" (carry) com dígitos finais > 5
 *   Subtração   → lógica reversa da adição + força "pegar emprestado" (borrow)
 *   Multiplicação → escala controlada para não explodir cedo demais
 *   Divisão     → divisões exatas com divisores e quocientes crescentes
 */
function generateBossHunterQuestion(operationIndex: number, enabledOps: OperationType[]): Question | null {
  if (enabledOps.length === 0) return null;

  const operation = enabledOps[Math.floor(Math.random() * enabledOps.length)];

  // Curva exponencial suave
  const scale = (operationIndex * 0.15) * (1 + operationIndex / 50);

  let x1: number, x2: number, answer: number;

  switch (operation) {
    case 'addition': {
      // Foco em carry-over: dígitos finais altos (6-9) forçam "vai um"
      const min = 2 + Math.floor(scale * 1.5);
      const max = 10 + Math.floor(scale * 4);
      x1 = randomInRange(min, max);
      x2 = randomInRange(min, max);

      // Em escala alta (>3), força pelo menos um operando com último dígito > 5
      // para maximizar carry-over mental (ex: 38 + 47 em vez de 32 + 41)
      if (scale > 3) {
        const forceCarry = () => {
          const base = randomInRange(min, max);
          const lastDigit = base % 10;
          if (lastDigit < 6) {
            return base - lastDigit + randomInRange(6, 9);
          }
          return base;
        };
        x1 = forceCarry();
        x2 = forceCarry();
      }

      answer = x1 + x2;
      break;
    }

    case 'subtraction': {
      // Lógica reversa da adição: gera A e B, o desafio é (A+B) - A = B
      // Isso garante resultados limpos que escalam naturalmente
      const min = 2 + Math.floor(scale * 1.5);
      const max = 10 + Math.floor(scale * 4);
      const a = randomInRange(min, max);
      const b = randomInRange(min, max);

      x1 = a + b;   // minuendo (sempre maior)
      x2 = a;        // subtraendo
      answer = b;

      // Em escala alta (>5), força "pegar emprestado" (borrow):
      // unidade do minuendo < unidade do subtraendo (ex: 42 - 18)
      if (scale > 5 && x1 > 20) {
        const x1Units = x1 % 10;
        const x2Units = x2 % 10;
        // Se não precisa borrowing, ajusta o subtraendo para forçar
        if (x1Units >= x2Units) {
          const newX2Units = randomInRange(x1Units + 1, 9);
          x2 = x2 - x2Units + newX2Units;
          if (x2 >= x1) x2 = x1 - randomInRange(1, 5);
          answer = x1 - x2;
        }
      }

      break;
    }

    case 'multiplication': {
      // Escala controlada — multiplicação explode rápido em dificuldade
      // Início: tabuadas 2-5 × 2-9
      // Intermediário: 6-9 × números de 2 dígitos baixos
      // Avançado: 2 dígitos × 1 dígito complexo
      const num1Min = 2 + Math.floor(scale / 3);
      const num1Max = 5 + Math.floor(scale / 1.5);
      const num2Min = 2 + Math.floor(scale / 4);
      const num2Max = 9 + Math.floor(scale / 1.2);

      x1 = randomInRange(num1Min, num1Max);
      x2 = randomInRange(num2Min, num2Max);

      // Garante que o maior número fique à esquerda para leitura natural
      if (x2 > x1) [x1, x2] = [x2, x1];

      answer = x1 * x2;
      break;
    }

    case 'division': {
      // Divisões sempre exatas. Escala o divisor para sair da zona de conforto
      // Late game: divisões como 225 ÷ 15 ou 144 ÷ 8
      const minDivisor = 2 + Math.floor(scale / 4);
      const maxDivisor = 5 + Math.floor(scale / 1.2);
      const minQuotient = 2 + Math.floor(scale / 3);
      const maxQuotient = 9 + Math.floor(scale / 1.5);

      x2 = randomInRange(minDivisor, maxDivisor);
      answer = randomInRange(minQuotient, maxQuotient);
      x1 = x2 * answer;  // garante divisão exata
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
  const [bossTimeRemainingMs, setBossTimeRemainingMs] = useState(NORMAL_TIME_LIMIT);
  const [currentTotalTimeMs, setCurrentTotalTimeMs] = useState(NORMAL_TIME_LIMIT);

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

  const startTimer = useCallback((limitMs: number) => {
    clearBossTimer();
    setCurrentTotalTimeMs(limitMs);
    const deadline = Date.now() + limitMs;
    setBossTimeRemainingMs(limitMs);
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
    startTimer(NORMAL_TIME_LIMIT);
  }, [settings, clearTransitionTimeouts, clearBossTimer, startTimer]);

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
      clearBossTimer();
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

    clearBossTimer();

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
          // Rare: two bosses in a row
          pendingBossQuestionRef.current = nextQuestion;
          setPhase('boss_incoming');
          addTimeout(() => {
            const bossQuestion = pendingBossQuestionRef.current;
            pendingBossQuestionRef.current = null;
            setState(prev => ({ ...prev, currentQuestion: bossQuestion }));
            setPhase('boss_active');
            startTimer(BOSS_TIME_LIMIT);
            questionStartRef.current = Date.now();
          }, BOSS_INCOMING_DURATION_MS);
        } else {
          // Normal: continue to next regular question
          setState(prev => ({ ...prev, currentQuestion: nextQuestion }));
          setPhase('playing');
          startTimer(NORMAL_TIME_LIMIT);
          questionStartRef.current = Date.now();
        }
      }, BOSS_DEFEATED_DURATION_MS);

      return { result, gameOver: false, bossDefeated: true };
    }

    // =========================================================
    // CASE 2: Next op IS a boss — enter the "breathing room" sequence
    // =========================================================
    if (nextIsBoss) {
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
            startTimer(BOSS_TIME_LIMIT);
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
    startTimer(NORMAL_TIME_LIMIT);
    questionStartRef.current = Date.now();

    return { result, gameOver: false, bossDefeated: false };
  }, [state, settings, clearBossTimer, startTimer, addTimeout]);

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

  return { state, phase, bossTimeRemainingMs, currentTotalTimeMs, startGame, submitAnswer, endGame, resetGame, triggerGameOver, calculateStats };
}

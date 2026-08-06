export type OperationType = 'addition' | 'subtraction' | 'multiplication' | 'division';
export type GameMode = 'classic' | 'bossHunter';

export interface OperationConfig {
  enabled: boolean;
  x1Min: number;
  x1Max: number;
  x2Min: number;
  x2Max: number;
}

export interface GameSettings {
  operations: Record<OperationType, OperationConfig>;
  soundEnabled: boolean;
  gameMode: GameMode;
}

export interface Question {
  x1: number;
  x2: number;
  operation: OperationType;
  answer: number;
  displayOperation: string;
}

export interface QuestionResult {
  question: Question;
  userAnswer: number;
  isCorrect: boolean;
  timeMs: number;
  timestamp: number;
}

export interface SubmitAnswerResult {
  result: QuestionResult;
  nextQuestion: Question | null;
}

export interface GameState {
  isPlaying: boolean;
  currentQuestion: Question | null;
  score: number;
  streak: number;
  bestStreak: number;
  results: QuestionResult[];
  sessionStartTime: number | null;
  questionStartTime: number | null;
}

export interface GameStats {
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  opm: number; // Operations per minute
  averageTimeMs: number;
  bestStreak: number;
  sessionDurationMs: number;
}

// Boss Hunter specific types
export type BossHunterPhase = 'idle' | 'playing' | 'pre_boss' | 'boss_incoming' | 'boss_active' | 'boss_defeated' | 'game_over';

export interface BossHunterGameState {
  isPlaying: boolean;
  currentQuestion: Question | null;
  results: QuestionResult[];
  bossesDefeated: number;
  sessionStartTime: number | null;
  gameOverReason?: 'wrong_answer' | 'timeout';
}

export interface BossHunterStats {
  totalOperations: number;
  bossesDefeated: number;
  sessionDurationMs: number;
  opm: number;
  averageTimeMs: number;
  levelReached: number;
  title: string;
}

export function getBossHunterTitle(operations: number): { title: string; level: number } {
  if (operations >= 150) return { title: 'Absolute Genius!', level: 8 };
  if (operations >= 100) return { title: 'Grande Gênio', level: 7 };
  if (operations >= 75) return { title: 'Gênio', level: 6 };
  if (operations >= 50) return { title: 'Lenda', level: 5 };
  if (operations >= 35) return { title: 'Mestre', level: 4 };
  if (operations >= 20) return { title: 'Caçador', level: 3 };
  if (operations >= 10) return { title: 'Guerreiro', level: 2 };
  return { title: 'Novato', level: 1 };
}

export interface SessionHistory {
  id: string;
  date: number; // timestamp
  stats: GameStats;
  gameMode?: GameMode;
  bossHunterStats?: BossHunterStats;
  results?: QuestionResult[];
}

export interface SavedData {
  settings: GameSettings;
  allTimeBestStreak: number;
  allTimeBestOpm: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
  sessionHistory: SessionHistory[];
  bossHunterBestRun: number;
  bossHunterBestBosses: number;
}

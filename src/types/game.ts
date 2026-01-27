export type OperationType = 'addition' | 'subtraction' | 'multiplication' | 'division';

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

export interface SavedData {
  settings: GameSettings;
  allTimeBestStreak: number;
  allTimeBestOpm: number;
  totalQuestionsAnswered: number;
  totalCorrectAnswers: number;
}

import { useState, useEffect, useCallback } from 'react';
import { SavedData, GameSettings, OperationType, GameStats, GameMode, SessionHistory, BossHunterStats } from '@/types/game';

const STORAGE_KEY = 'mathtype-data';

const defaultSettings: GameSettings = {
  operations: {
    addition: { enabled: true, x1Min: 10, x1Max: 999, x2Min: 10, x2Max: 99 },
    subtraction: { enabled: true, x1Min: 10, x1Max: 999, x2Min: 10, x2Max: 99 },
    multiplication: { enabled: true, x1Min: 10, x1Max: 99, x2Min: 2, x2Max: 9 },
    division: { enabled: false, x1Min: 10, x1Max: 100, x2Min: 2, x2Max: 10 },
  },
  soundEnabled: true,
  gameMode: 'classic',
};

const defaultData: SavedData = {
  settings: defaultSettings,
  allTimeBestStreak: 0,
  allTimeBestOpm: 0,
  totalQuestionsAnswered: 0,
  totalCorrectAnswers: 0,
  sessionHistory: [],
  bossHunterBestRun: 0,
  bossHunterBestBosses: 0,
};

export function useLocalStorage() {
  const [data, setData] = useState<SavedData>(defaultData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const mergedSettings = {
          ...defaultSettings,
          ...parsed.settings,
          operations: { ...defaultSettings.operations, ...(parsed.settings?.operations || {}) },
        };
        setData({ ...defaultData, ...parsed, settings: mergedSettings });
      }
    } catch (e) {
      console.error('Failed to load saved data:', e);
    }
    setIsLoaded(true);
  }, []);

  const saveData = useCallback((newData: Partial<SavedData>) => {
    setData(prev => {
      const updated = { ...prev, ...newData };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch (e) { console.error('Failed to save data:', e); }
      return updated;
    });
  }, []);

  const updateSettings = useCallback((settings: GameSettings) => {
    saveData({ settings });
  }, [saveData]);

  const updateStats = useCallback((correct: number, total: number, bestStreak: number, opm: number, stats: GameStats, results?: QuestionResult[]) => {
    setData(prev => {
      const newSession: SessionHistory = { id: Date.now().toString(), date: Date.now(), stats, gameMode: 'classic', results };
      const updatedHistory = [newSession, ...prev.sessionHistory].slice(0, 50);
      const updated = {
        ...prev,
        totalQuestionsAnswered: prev.totalQuestionsAnswered + total,
        totalCorrectAnswers: prev.totalCorrectAnswers + correct,
        allTimeBestStreak: Math.max(prev.allTimeBestStreak, bestStreak),
        allTimeBestOpm: Math.max(prev.allTimeBestOpm, opm),
        sessionHistory: updatedHistory,
      };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch (e) { console.error('Failed to save stats:', e); }
      return updated;
    });
  }, []);

  const updateBossHunterStats = useCallback((bhStats: BossHunterStats, results?: QuestionResult[]) => {
    setData(prev => {
      const newSession: SessionHistory = {
        id: Date.now().toString(),
        date: Date.now(),
        stats: { totalQuestions: bhStats.totalOperations, correctAnswers: bhStats.totalOperations, accuracy: 100, opm: bhStats.opm, averageTimeMs: bhStats.averageTimeMs, bestStreak: bhStats.totalOperations, sessionDurationMs: bhStats.sessionDurationMs },
        gameMode: 'bossHunter',
        bossHunterStats: bhStats,
        results,
      };
      const updatedHistory = [newSession, ...prev.sessionHistory].slice(0, 50);
      const updated = {
        ...prev,
        bossHunterBestRun: Math.max(prev.bossHunterBestRun, bhStats.totalOperations),
        bossHunterBestBosses: Math.max(prev.bossHunterBestBosses, bhStats.bossesDefeated),
        sessionHistory: updatedHistory,
      };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch (e) { console.error('Failed to save boss hunter stats:', e); }
      return updated;
    });
  }, []);

  const toggleOperation = useCallback((operation: OperationType) => {
    setData(prev => {
      const updated = { ...prev, settings: { ...prev.settings, operations: { ...prev.settings.operations, [operation]: { ...prev.settings.operations[operation], enabled: !prev.settings.operations[operation].enabled } } } };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch (e) { console.error('Failed to save settings:', e); }
      return updated;
    });
  }, []);

  const updateOperationRange = useCallback((operation: OperationType, field: 'x1Min' | 'x1Max' | 'x2Min' | 'x2Max', value: number) => {
    setData(prev => {
      const updated = { ...prev, settings: { ...prev.settings, operations: { ...prev.settings.operations, [operation]: { ...prev.settings.operations[operation], [field]: value } } } };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch (e) { console.error('Failed to save settings:', e); }
      return updated;
    });
  }, []);

  const toggleSound = useCallback(() => {
    setData(prev => {
      const updated = { ...prev, settings: { ...prev.settings, soundEnabled: !prev.settings.soundEnabled } };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch (e) { console.error('Failed to save settings:', e); }
      return updated;
    });
  }, []);

  const setGameMode = useCallback((mode: GameMode) => {
    setData(prev => {
      const updated = { ...prev, settings: { ...prev.settings, gameMode: mode } };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch (e) { console.error('Failed to save game mode:', e); }
      return updated;
    });
  }, []);

  return { data, isLoaded, updateSettings, updateStats, updateBossHunterStats, toggleOperation, updateOperationRange, toggleSound, setGameMode };
}

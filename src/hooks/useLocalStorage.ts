import { useState, useEffect, useCallback } from 'react';
import { SavedData, GameSettings, OperationType, GameStats, GameMode, SessionHistory, BossHunterStats, QuestionResult } from '@/types/game';
import { supabase } from '@/lib/supabase';

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

// ── Supabase helpers ──────────────────────────────────────────────

async function fetchGameData(): Promise<Partial<SavedData> | null> {
  const { data, error } = await supabase
    .from('game_data')
    .select('*')
    .eq('id', 1)
    .single();

  if (error || !data) return null;

  return {
    settings: { ...defaultSettings, ...(data.settings || {}) },
    allTimeBestStreak: data.all_time_best_streak ?? 0,
    allTimeBestOpm: data.all_time_best_opm ?? 0,
    totalQuestionsAnswered: data.total_questions_answered ?? 0,
    totalCorrectAnswers: data.total_correct_answers ?? 0,
    bossHunterBestRun: data.boss_hunter_best_run ?? 0,
    bossHunterBestBosses: data.boss_hunter_best_bosses ?? 0,
  };
}

async function fetchSessionHistory(): Promise<SessionHistory[]> {
  const { data, error } = await supabase
    .from('session_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !data) return [];

  return data.map((row: any) => ({
    id: row.id,
    date: new Date(row.created_at).getTime(),
    stats: row.stats || {},
    gameMode: row.game_mode || 'classic',
    bossHunterStats: row.boss_hunter_stats || undefined,
    results: row.results || undefined,
  }));
}

async function upsertGameData(d: SavedData): Promise<void> {
  await supabase
    .from('game_data')
    .upsert({
      id: 1,
      settings: d.settings,
      all_time_best_streak: d.allTimeBestStreak,
      all_time_best_opm: d.allTimeBestOpm,
      total_questions_answered: d.totalQuestionsAnswered,
      total_correct_answers: d.totalCorrectAnswers,
      boss_hunter_best_run: d.bossHunterBestRun,
      boss_hunter_best_bosses: d.bossHunterBestBosses,
      updated_at: new Date().toISOString(),
    });
}

async function insertSession(session: SessionHistory): Promise<void> {
  await supabase
    .from('session_history')
    .insert({
      id: session.id,
      created_at: new Date(session.date).toISOString(),
      game_mode: session.gameMode || 'classic',
      stats: session.stats,
      boss_hunter_stats: session.bossHunterStats || null,
      results: session.results || null,
    });
}

// ── Hook ──────────────────────────────────────────────────────────

export function useLocalStorage() {
  const [data, setData] = useState<SavedData>(defaultData);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initial load from Supabase
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [gameData, history] = await Promise.all([
          fetchGameData(),
          fetchSessionHistory(),
        ]);
        if (cancelled) return;

        if (gameData) {
          setData({
            ...defaultData,
            ...gameData,
            settings: { ...defaultSettings, ...gameData.settings, operations: { ...defaultSettings.operations, ...(gameData.settings?.operations || {}) } },
            sessionHistory: history,
          });
        }
      } catch (e) {
        console.error('Failed to load from Supabase:', e);
      }
      if (!cancelled) setIsLoaded(true);
    })();
    return () => { cancelled = true; };
  }, []);

  // Persist helper: optimistic local update + async Supabase write
  const persist = useCallback((updater: (prev: SavedData) => SavedData) => {
    setData(prev => {
      const updated = updater(prev);
      upsertGameData(updated).catch(e => console.error('Supabase save error:', e));
      return updated;
    });
  }, []);

  const updateSettings = useCallback((settings: GameSettings) => {
    persist(prev => ({ ...prev, settings }));
  }, [persist]);

  const updateStats = useCallback((correct: number, total: number, bestStreak: number, opm: number, stats: GameStats, results?: QuestionResult[]) => {
    const newSession: SessionHistory = { id: Date.now().toString(), date: Date.now(), stats, gameMode: 'classic', results };

    // Insert session row
    insertSession(newSession).catch(e => console.error('Supabase session insert error:', e));

    setData(prev => {
      const updatedHistory = [newSession, ...prev.sessionHistory].slice(0, 50);
      const updated: SavedData = {
        ...prev,
        totalQuestionsAnswered: prev.totalQuestionsAnswered + total,
        totalCorrectAnswers: prev.totalCorrectAnswers + correct,
        allTimeBestStreak: Math.max(prev.allTimeBestStreak, bestStreak),
        allTimeBestOpm: Math.max(prev.allTimeBestOpm, opm),
        sessionHistory: updatedHistory,
      };
      upsertGameData(updated).catch(e => console.error('Supabase save error:', e));
      return updated;
    });
  }, []);

  const updateBossHunterStats = useCallback((bhStats: BossHunterStats, results?: QuestionResult[]) => {
    const newSession: SessionHistory = {
      id: Date.now().toString(),
      date: Date.now(),
      stats: { totalQuestions: bhStats.totalOperations, correctAnswers: bhStats.totalOperations, accuracy: 100, opm: bhStats.opm, averageTimeMs: bhStats.averageTimeMs, bestStreak: bhStats.totalOperations, sessionDurationMs: bhStats.sessionDurationMs },
      gameMode: 'bossHunter',
      bossHunterStats: bhStats,
      results,
    };

    insertSession(newSession).catch(e => console.error('Supabase session insert error:', e));

    setData(prev => {
      const updatedHistory = [newSession, ...prev.sessionHistory].slice(0, 50);
      const updated: SavedData = {
        ...prev,
        bossHunterBestRun: Math.max(prev.bossHunterBestRun, bhStats.totalOperations),
        bossHunterBestBosses: Math.max(prev.bossHunterBestBosses, bhStats.bossesDefeated),
        sessionHistory: updatedHistory,
      };
      upsertGameData(updated).catch(e => console.error('Supabase save error:', e));
      return updated;
    });
  }, []);

  const toggleOperation = useCallback((operation: OperationType) => {
    persist(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        operations: {
          ...prev.settings.operations,
          [operation]: { ...prev.settings.operations[operation], enabled: !prev.settings.operations[operation].enabled },
        },
      },
    }));
  }, [persist]);

  const updateOperationRange = useCallback((operation: OperationType, field: 'x1Min' | 'x1Max' | 'x2Min' | 'x2Max', value: number) => {
    persist(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        operations: {
          ...prev.settings.operations,
          [operation]: { ...prev.settings.operations[operation], [field]: value },
        },
      },
    }));
  }, [persist]);

  const toggleSound = useCallback(() => {
    persist(prev => ({
      ...prev,
      settings: { ...prev.settings, soundEnabled: !prev.settings.soundEnabled },
    }));
  }, [persist]);

  const setGameMode = useCallback((mode: GameMode) => {
    persist(prev => ({
      ...prev,
      settings: { ...prev.settings, gameMode: mode },
    }));
  }, [persist]);

  return { data, isLoaded, updateSettings, updateStats, updateBossHunterStats, toggleOperation, updateOperationRange, toggleSound, setGameMode };
}

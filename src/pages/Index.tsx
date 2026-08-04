import { useState, useCallback, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { GameArea } from '@/components/game/GameArea';
import { BossHunterArea } from '@/components/game/BossHunterArea';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { HistoryModal } from '@/components/history/HistoryModal';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { OperationType, GameStats, BossHunterStats } from '@/types/game';

const Index = () => {
  const {
    data, isLoaded, toggleOperation, updateOperationRange,
    toggleSound, updateStats, updateBossHunterStats, setGameMode,
  } = useLocalStorage();
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [settingsSaveCount, setSettingsSaveCount] = useState(0);

  useEffect(() => {
    document.documentElement.classList.add('minimal-scrollbar');
    document.body.classList.add('minimal-scrollbar');
    return () => {
      document.documentElement.classList.remove('minimal-scrollbar');
      document.body.classList.remove('minimal-scrollbar');
    };
  }, []);

  const handleSaveSettings = useCallback(() => {
    setShowSettings(false);
    setSettingsSaveCount(prev => prev + 1);
  }, []);

  const handleUpdateStats = useCallback((correct: number, total: number, bestStreak: number, opm: number, stats: GameStats) => {
    updateStats(correct, total, bestStreak, opm, stats);
  }, [updateStats]);

  const handleUpdateBossHunterStats = useCallback((stats: BossHunterStats) => {
    updateBossHunterStats(stats);
  }, [updateBossHunterStats]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary text-2xl animate-pulse">Carregando...</div>
      </div>
    );
  }

  const isBossHunter = data.settings.gameMode === 'bossHunter';

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onSettingsClick={() => setShowSettings(true)}
        onHistoryClick={() => setShowHistory(true)}
        showSettings={showSettings}
        showHistory={showHistory}
      />

      <main className="flex-1 container mx-auto px-4 py-8">
        {isBossHunter ? (
          <BossHunterArea
            settings={data.settings}
            onUpdateStats={handleUpdateBossHunterStats}
            bestRun={data.bossHunterBestRun}
            bestBosses={data.bossHunterBestBosses}
            key={`bh-${settingsSaveCount}`}
          />
        ) : (
          <GameArea
            settings={data.settings}
            onUpdateStats={handleUpdateStats}
            allTimeBestStreak={data.allTimeBestStreak}
            allTimeBestOpm={data.allTimeBestOpm}
            key={`classic-${settingsSaveCount}`}
          />
        )}
      </main>

      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        onSave={handleSaveSettings}
        settings={data.settings}
        onToggleOperation={(op: OperationType) => toggleOperation(op)}
        onRangeChange={(op: OperationType, field, value) => updateOperationRange(op, field, value)}
        onToggleSound={toggleSound}
        onChangeGameMode={setGameMode}
      />

      <HistoryModal
        open={showHistory}
        onClose={() => setShowHistory(false)}
        sessions={data.sessionHistory}
        allTimeBestStreak={data.allTimeBestStreak}
        allTimeBestOpm={data.allTimeBestOpm}
      />

      <footer className="border-t border-border py-4">
        <div className="container mx-auto px-4 text-center text-sm text-ghost">
        </div>
      </footer>
    </div>
  );
};

export default Index;
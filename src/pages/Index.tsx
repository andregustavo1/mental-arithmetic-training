import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { GameArea } from '@/components/game/GameArea';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { OperationType } from '@/types/game';
const Index = () => {
  const {
    data,
    isLoaded,
    toggleOperation,
    updateOperationRange,
    toggleSound,
    updateStats
  } = useLocalStorage();
  const [showSettings, setShowSettings] = useState(false);
  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary text-2xl animate-pulse">Carregando...</div>
      </div>;
  }
  return <div className="min-h-screen flex flex-col">
      <Header onSettingsClick={() => setShowSettings(true)} showSettings={showSettings} allTimeBestStreak={data.allTimeBestStreak} allTimeBestOpm={data.allTimeBestOpm} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <GameArea settings={data.settings} onUpdateStats={updateStats} allTimeBestStreak={data.allTimeBestStreak} allTimeBestOpm={data.allTimeBestOpm} />
      </main>

      {/* Settings Modal */}
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} settings={data.settings} onToggleOperation={(op: OperationType) => toggleOperation(op)} onRangeChange={(op: OperationType, field, value) => updateOperationRange(op, field, value)} onToggleSound={toggleSound} />

      {/* Footer */}
      <footer className="border-t border-border py-4">
        <div className="container mx-auto px-4 text-center text-sm text-ghost">
          
        </div>
      </footer>
    </div>;
};
export default Index;
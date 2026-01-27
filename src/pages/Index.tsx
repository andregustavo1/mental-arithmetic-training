import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { GameArea } from '@/components/game/GameArea';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { OperationType } from '@/types/game';
import { cn } from '@/lib/utils';

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-primary text-2xl animate-pulse">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onSettingsClick={() => setShowSettings(!showSettings)}
        showSettings={showSettings}
        allTimeBestStreak={data.allTimeBestStreak}
        allTimeBestOpm={data.allTimeBestOpm}
      />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className={cn(
          "grid gap-8 transition-all duration-300",
          showSettings ? "lg:grid-cols-[1fr,400px]" : "grid-cols-1"
        )}>
          {/* Game Area */}
          <GameArea
            settings={data.settings}
            onUpdateStats={updateStats}
            allTimeBestStreak={data.allTimeBestStreak}
            allTimeBestOpm={data.allTimeBestOpm}
          />

          {/* Settings Panel */}
          {showSettings && (
            <aside className="bg-card/50 backdrop-blur-sm border border-border rounded-lg p-6 h-fit">
              <SettingsPanel
                settings={data.settings}
                onToggleOperation={(op: OperationType) => toggleOperation(op)}
                onRangeChange={(op: OperationType, field, value) => updateOperationRange(op, field, value)}
                onToggleSound={toggleSound}
              />
            </aside>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4">
        <div className="container mx-auto px-4 text-center text-sm text-ghost">
          <p>
            Inspirado em{' '}
            <a 
              href="https://monkeytype.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              monkeytype.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

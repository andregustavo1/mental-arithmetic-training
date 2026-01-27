import { OperationToggle } from './OperationToggle';
import { GameSettings, OperationType } from '@/types/game';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Volume2, VolumeX } from 'lucide-react';

interface SettingsPanelProps {
  settings: GameSettings;
  onToggleOperation: (operation: OperationType) => void;
  onRangeChange: (operation: OperationType, field: 'x1Min' | 'x1Max' | 'x2Min' | 'x2Max', value: number) => void;
  onToggleSound: () => void;
}

export function SettingsPanel({ 
  settings, 
  onToggleOperation, 
  onRangeChange,
  onToggleSound 
}: SettingsPanelProps) {
  const operations: OperationType[] = ['addition', 'subtraction', 'multiplication', 'division'];
  
  const hasEnabledOperation = operations.some(op => settings.operations[op].enabled);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-highlight mb-4">Operações</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {operations.map(operation => (
            <OperationToggle
              key={operation}
              operation={operation}
              config={settings.operations[operation]}
              onToggle={() => onToggleOperation(operation)}
              onRangeChange={(field, value) => onRangeChange(operation, field, value)}
            />
          ))}
        </div>
        {!hasEnabledOperation && (
          <p className="mt-4 text-center text-destructive text-sm">
            Selecione pelo menos uma operação para começar
          </p>
        )}
      </div>

      <div className="border-t border-border pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings.soundEnabled ? (
              <Volume2 className="w-5 h-5 text-primary" />
            ) : (
              <VolumeX className="w-5 h-5 text-ghost" />
            )}
            <Label htmlFor="sound-toggle" className="text-lg font-medium text-highlight">
              Som
            </Label>
          </div>
          <Switch
            id="sound-toggle"
            checked={settings.soundEnabled}
            onCheckedChange={onToggleSound}
          />
        </div>
        <p className="text-sm text-ghost mt-2">
          Feedback sonoro para acertos e erros
        </p>
      </div>
    </div>
  );
}

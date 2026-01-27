import { OperationType, GameSettings } from '@/types/game';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { NumberPicker } from '@/components/ui/number-picker';
import { Volume2, VolumeX, X } from 'lucide-react';
import { cn } from '@/lib/utils';
interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  settings: GameSettings;
  onToggleOperation: (operation: OperationType) => void;
  onRangeChange: (operation: OperationType, field: 'x1Min' | 'x1Max' | 'x2Min' | 'x2Max', value: number) => void;
  onToggleSound: () => void;
}

const OPERATION_LABELS: Record<OperationType, { name: string; symbol: string }> = {
  addition: { name: 'Adição', symbol: '+' },
  subtraction: { name: 'Subtração', symbol: '−' },
  multiplication: { name: 'Multiplicação', symbol: '×' },
  division: { name: 'Divisão', symbol: '÷' },
};

const operations: OperationType[] = ['addition', 'subtraction', 'multiplication', 'division'];

export function SettingsModal({ 
  open, 
  onClose, 
  settings, 
  onToggleOperation, 
  onRangeChange,
  onToggleSound 
}: SettingsModalProps) {
  const hasEnabledOperation = operations.some(op => settings.operations[op].enabled);

  if (!open) return null;

  return (
    <>
      {/* Backdrop with blur */}
      <div 
        className={cn(
          "fixed inset-0 z-50 bg-background/80 backdrop-blur-md",
          "animate-in fade-in-0 duration-300"
        )}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className={cn(
            "relative w-full max-w-2xl max-h-[85vh] overflow-y-auto",
            "bg-card border border-border rounded-xl shadow-2xl",
            "animate-in zoom-in-95 fade-in-0 duration-300"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-highlight">Configurações</h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg text-muted-foreground hover:text-highlight hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Operations */}
            <div>
              <h3 className="text-lg font-semibold text-highlight mb-4">Operações</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {operations.map(operation => {
                  const config = settings.operations[operation];
                  const { name, symbol } = OPERATION_LABELS[operation];
                  
                  return (
                    <div 
                      key={operation}
                      className={cn(
                        "rounded-lg border p-4 transition-all duration-200",
                        config.enabled 
                          ? "bg-secondary/50 border-primary/30" 
                          : "bg-secondary/20 border-border opacity-60"
                      )}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold text-primary w-6 text-center">{symbol}</span>
                          <Label className="text-base font-medium text-highlight">
                            {name}
                          </Label>
                        </div>
                        <Switch
                          checked={config.enabled}
                          onCheckedChange={() => onToggleOperation(operation)}
                        />
                      </div>

                      {config.enabled && (
                        <div className="space-y-3">
                          {/* X1 Range */}
                          <div>
                            <Label className="text-xs text-ghost uppercase tracking-wider block mb-2">
                              X1 (intervalo)
                            </Label>
                            <div className="flex items-center justify-between">
                              <NumberPicker
                                value={config.x1Min}
                                onChange={(value) => onRangeChange(operation, 'x1Min', value)}
                                min={0}
                                max={9999}
                              />
                              <span className="text-ghost text-sm">a</span>
                              <NumberPicker
                                value={config.x1Max}
                                onChange={(value) => onRangeChange(operation, 'x1Max', value)}
                                min={0}
                                max={9999}
                              />
                            </div>
                          </div>

                          {/* X2 Range */}
                          <div>
                            <Label className="text-xs text-ghost uppercase tracking-wider block mb-2">
                              X2 (intervalo)
                            </Label>
                            <div className="flex items-center justify-between">
                              <NumberPicker
                                value={config.x2Min}
                                onChange={(value) => onRangeChange(operation, 'x2Min', value)}
                                min={0}
                                max={9999}
                              />
                              <span className="text-ghost text-sm">a</span>
                              <NumberPicker
                                value={config.x2Max}
                                onChange={(value) => onRangeChange(operation, 'x2Max', value)}
                                min={0}
                                max={9999}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {!hasEnabledOperation && (
                <p className="mt-4 text-center text-destructive text-sm">
                  Selecione pelo menos uma operação para começar
                </p>
              )}
            </div>

            {/* Sound Toggle */}
            <div className="border-t border-border pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {settings.soundEnabled ? (
                    <Volume2 className="w-5 h-5 text-primary" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-ghost" />
                  )}
                  <div>
                    <Label className="text-base font-medium text-highlight block">
                      Som
                    </Label>
                    <p className="text-sm text-ghost">
                      Feedback sonoro para acertos e erros
                    </p>
                  </div>
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={onToggleSound}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

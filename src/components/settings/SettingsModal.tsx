import { OperationType, GameSettings, GameMode } from '@/types/game';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { NumberPicker } from '@/components/ui/number-picker';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, X, Save, Swords, Crosshair } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  settings: GameSettings;
  onToggleOperation: (operation: OperationType) => void;
  onRangeChange: (operation: OperationType, field: 'x1Min' | 'x1Max' | 'x2Min' | 'x2Max', value: number) => void;
  onToggleSound: () => void;
  onChangeGameMode: (mode: GameMode) => void;
}

const OPERATION_LABELS: Record<OperationType, { name: string; symbol: string }> = {
  addition: { name: 'Adição', symbol: '+' },
  subtraction: { name: 'Subtração', symbol: '−' },
  multiplication: { name: 'Multiplicação', symbol: '×' },
  division: { name: 'Divisão', symbol: '÷' },
};

const operations: OperationType[] = ['addition', 'subtraction', 'multiplication', 'division'];

export function SettingsModal({
  open, onClose, onSave, settings, onToggleOperation, onRangeChange, onToggleSound, onChangeGameMode,
}: SettingsModalProps) {
  const hasEnabledOperation = operations.some(op => settings.operations[op].enabled);
  const isBossHunter = settings.gameMode === 'bossHunter';
  useBodyScrollLock(open);
  if (!open) return null;

  return (
    <>
      <div className={cn("fixed inset-0 z-50 bg-background/80 backdrop-blur-md", "animate-in fade-in-0 duration-300")} onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto overscroll-contain">
        <div className={cn("relative w-full max-w-2xl max-h-[85vh] flex flex-col select-none", "bg-card border border-border rounded-xl shadow-2xl", "animate-in zoom-in-95 fade-in-0 duration-300", "overscroll-contain")} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex-shrink-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between rounded-t-xl">
            <h2 className="text-2xl font-bold text-highlight">Configurações</h2>
            <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:text-highlight hover:bg-secondary transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="minimal-scrollbar flex-1 overflow-y-auto p-6 space-y-6">
            {/* Game Mode */}
            <div>
              <h3 className="text-lg font-semibold text-highlight mb-4">Modo de Jogo</h3>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => onChangeGameMode('classic')} className={cn("rounded-lg border p-4 transition-all duration-200 text-left", !isBossHunter ? "bg-primary/10 border-primary/50 ring-2 ring-primary/30" : "bg-secondary/20 border-border hover:bg-secondary/40")}>
                  <div className="flex items-center gap-2 mb-2">
                    <Crosshair className={cn("w-5 h-5", !isBossHunter ? "text-primary" : "text-ghost")} />
                    <span className={cn("font-semibold", !isBossHunter ? "text-primary" : "text-highlight")}>Clássico</span>
                  </div>
                  <p className="text-xs text-ghost">Treino livre com operações configuráveis.</p>
                </button>
                <button onClick={() => onChangeGameMode('bossHunter')} className={cn("rounded-lg border p-4 transition-all duration-200 text-left", isBossHunter ? "bg-destructive/10 border-destructive/50 ring-2 ring-destructive/30" : "bg-secondary/20 border-border hover:bg-secondary/40")}>
                  <div className="flex items-center gap-2 mb-2">
                    <Swords className={cn("w-5 h-5", isBossHunter ? "text-destructive" : "text-ghost")} />
                    <span className={cn("font-semibold", isBossHunter ? "text-destructive" : "text-highlight")}>Boss Hunter</span>
                  </div>
                  <p className="text-xs text-ghost">Dificuldade progressiva. Sem margem de erro. Boss a cada 5 ops.</p>
                </button>
              </div>
            </div>

            {/* Operations */}
            <div className="border-t border-border pt-6">
              <h3 className="text-lg font-semibold text-highlight mb-2">Operações</h3>
              {isBossHunter && (
                <p className="text-xs text-ghost mb-4">No modo Boss Hunter, os intervalos são automáticos e aumentam progressivamente.</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {operations.map(operation => {
                  const config = settings.operations[operation];
                  const { name, symbol } = OPERATION_LABELS[operation];
                  return (
                    <div key={operation} className={cn("rounded-lg border p-4 transition-all duration-200", config.enabled ? "bg-secondary/50 border-primary/30" : "bg-secondary/20 border-border opacity-60")}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold text-primary w-6 text-center">{symbol}</span>
                          <Label className="text-base font-medium text-highlight">{name}</Label>
                        </div>
                        <Switch checked={config.enabled} onCheckedChange={() => onToggleOperation(operation)} />
                      </div>
                      {!isBossHunter && (
                        <div className={cn("grid transition-all duration-300 ease-out", config.enabled ? "grid-rows-[1fr] opacity-100 mt-0" : "grid-rows-[0fr] opacity-0 mt-0")} aria-hidden={!config.enabled}>
                          <div className={cn("overflow-hidden space-y-3 transition-transform duration-300 ease-out", config.enabled ? "translate-y-0" : "-translate-y-1 pointer-events-none")}>
                            <div>
                              <Label className="text-xs text-ghost uppercase tracking-wider block mb-2">X1 (intervalo)</Label>
                              <div className="flex items-center justify-between">
                                <NumberPicker value={config.x1Min} onChange={(value) => onRangeChange(operation, 'x1Min', value)} min={0} max={9999} />
                                <span className="text-ghost text-sm">a</span>
                                <NumberPicker value={config.x1Max} onChange={(value) => onRangeChange(operation, 'x1Max', value)} min={0} max={9999} />
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-ghost uppercase tracking-wider block mb-2">X2 (intervalo)</Label>
                              <div className="flex items-center justify-between">
                                <NumberPicker value={config.x2Min} onChange={(value) => onRangeChange(operation, 'x2Min', value)} min={0} max={9999} />
                                <span className="text-ghost text-sm">a</span>
                                <NumberPicker value={config.x2Max} onChange={(value) => onRangeChange(operation, 'x2Max', value)} min={0} max={9999} />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {!hasEnabledOperation && (
                <p className="mt-4 text-center text-destructive text-sm">Selecione pelo menos uma operação para começar</p>
              )}
            </div>

            {/* Sound */}
            <div className="border-t border-border pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {settings.soundEnabled ? <Volume2 className="w-5 h-5 text-primary" /> : <VolumeX className="w-5 h-5 text-ghost" />}
                  <div>
                    <Label className="text-base font-medium text-highlight block">Som</Label>
                    <p className="text-sm text-ghost">Feedback sonoro.</p>
                  </div>
                </div>
                <Switch checked={settings.soundEnabled} onCheckedChange={onToggleSound} />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 bg-card border-t border-border px-6 py-4 rounded-b-xl">
            <Button onClick={onSave} disabled={!hasEnabledOperation} className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="lg">
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { OperationType, OperationConfig } from '@/types/game';
import { cn } from '@/lib/utils';

interface OperationToggleProps {
  operation: OperationType;
  config: OperationConfig;
  onToggle: () => void;
  onRangeChange: (field: 'x1Min' | 'x1Max' | 'x2Min' | 'x2Max', value: number) => void;
}

const OPERATION_LABELS: Record<OperationType, { name: string; symbol: string }> = {
  addition: { name: 'Adição', symbol: '+' },
  subtraction: { name: 'Subtração', symbol: '−' },
  multiplication: { name: 'Multiplicação', symbol: '×' },
  division: { name: 'Divisão', symbol: '÷' },
};

export function OperationToggle({ operation, config, onToggle, onRangeChange }: OperationToggleProps) {
  const { name, symbol } = OPERATION_LABELS[operation];

  return (
    <div className={cn(
      "rounded-lg border p-4 transition-all duration-200",
      config.enabled 
        ? "bg-secondary/50 border-primary/30" 
        : "bg-secondary/20 border-border opacity-60"
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-primary">{symbol}</span>
          <Label htmlFor={`toggle-${operation}`} className="text-lg font-medium text-highlight">
            {name}
          </Label>
        </div>
        <Switch
          id={`toggle-${operation}`}
          checked={config.enabled}
          onCheckedChange={onToggle}
        />
      </div>

      {config.enabled && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <Label className="text-xs text-ghost uppercase tracking-wider">X1 (intervalo)</Label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                value={config.x1Min}
                onChange={(e) => onRangeChange('x1Min', parseInt(e.target.value) || 0)}
                className="w-20 px-2 py-1 bg-input border border-border rounded text-highlight text-center"
                min={0}
              />
              <span className="text-ghost">a</span>
              <input
                type="number"
                value={config.x1Max}
                onChange={(e) => onRangeChange('x1Max', parseInt(e.target.value) || 0)}
                className="w-20 px-2 py-1 bg-input border border-border rounded text-highlight text-center"
                min={0}
              />
            </div>
          </div>

          <div>
            <Label className="text-xs text-ghost uppercase tracking-wider">X2 (intervalo)</Label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                value={config.x2Min}
                onChange={(e) => onRangeChange('x2Min', parseInt(e.target.value) || 0)}
                className="w-20 px-2 py-1 bg-input border border-border rounded text-highlight text-center"
                min={0}
              />
              <span className="text-ghost">a</span>
              <input
                type="number"
                value={config.x2Max}
                onChange={(e) => onRangeChange('x2Max', parseInt(e.target.value) || 0)}
                className="w-20 px-2 py-1 bg-input border border-border rounded text-highlight text-center"
                min={0}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

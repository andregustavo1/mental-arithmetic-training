import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRef, useCallback, useEffect } from 'react';

interface NumberPickerProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function NumberPicker({
  value,
  onChange,
  min = 0,
  max = 9999,
  step = 1,
  className
}: NumberPickerProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const stopContinuous = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const valueRef = useRef(value);
  valueRef.current = value;

  const startContinuous = useCallback((direction: 'increment' | 'decrement') => {
    const updateValue = () => {
      const currentValue = valueRef.current;
      const newValue = direction === 'increment' ? currentValue + step : currentValue - step;
      if (newValue >= min && newValue <= max) {
        onChange(newValue);
      }
    };

    // Initial delay before continuous mode starts
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(updateValue, 75);
    }, 300);
  }, [onChange, step, min, max]);

  useEffect(() => {
    return () => stopContinuous();
  }, [stopContinuous]);

  const handleDecrement = () => {
    const newValue = value - step;
    if (newValue >= min) {
      onChange(newValue);
    }
  };

  const handleIncrement = () => {
    const newValue = value + step;
    if (newValue <= max) {
      onChange(newValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    } else if (e.target.value === '') {
      onChange(min);
    }
  };

  return (
    <div className={cn("flex items-center gap-0 select-none", className)}>
      <button
        type="button"
        onClick={handleDecrement}
        onMouseDown={() => startContinuous('decrement')}
        onMouseUp={stopContinuous}
        onMouseLeave={stopContinuous}
        onTouchStart={() => startContinuous('decrement')}
        onTouchEnd={stopContinuous}
        disabled={value <= min}
        className={cn(
          "w-8 h-8 flex items-center justify-center rounded-full",
          "bg-secondary/50 text-muted-foreground",
          "hover:bg-secondary hover:text-highlight",
          "transition-colors duration-150",
          "disabled:opacity-30 disabled:cursor-not-allowed"
        )}
      >
        <Minus className="w-4 h-4" />
      </button>
      
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleInputChange}
        className={cn(
          "w-14 px-1 py-1.5 text-center text-sm font-medium bg-transparent text-highlight select-text",
          "border-none outline-none appearance-none",
          "[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        )}
      />
      
      <button
        type="button"
        onClick={handleIncrement}
        onMouseDown={() => startContinuous('increment')}
        onMouseUp={stopContinuous}
        onMouseLeave={stopContinuous}
        onTouchStart={() => startContinuous('increment')}
        onTouchEnd={stopContinuous}
        disabled={value >= max}
        className={cn(
          "w-8 h-8 flex items-center justify-center rounded-full",
          "bg-secondary/50 text-muted-foreground",
          "hover:bg-secondary hover:text-highlight",
          "transition-colors duration-150",
          "disabled:opacity-30 disabled:cursor-not-allowed"
        )}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}
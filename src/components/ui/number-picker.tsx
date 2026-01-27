import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    <div className={cn("flex items-center gap-1", className)}>
      <button
        type="button"
        onClick={handleDecrement}
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
          "w-14 px-2 py-1.5 text-center text-sm font-medium",
          "bg-transparent text-highlight",
          "border-none outline-none",
          "appearance-none",
          "[&::-webkit-outer-spin-button]:appearance-none",
          "[&::-webkit-inner-spin-button]:appearance-none"
        )}
      />
      
      <button
        type="button"
        onClick={handleIncrement}
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

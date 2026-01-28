import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import { CornerDownLeft } from 'lucide-react';

interface AnswerInputProps {
  onSubmit: (answer: number) => void;
  disabled?: boolean;
  feedbackState: 'idle' | 'correct' | 'wrong';
  onKeyPress?: () => void;
}

export function AnswerInput({ onSubmit, disabled, feedbackState, onKeyPress }: AnswerInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  // Clear input immediately when feedback starts
  useEffect(() => {
    if (feedbackState !== 'idle') {
      setValue('');
    }
  }, [feedbackState]);

  // Refocus input when feedback ends (animation complete)
  useEffect(() => {
    if (feedbackState === 'idle') {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [feedbackState]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue)) {
        onSubmit(numValue);
      }
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      // Allow backspace/delete
    } else if (!/^\d$/.test(e.key) && e.key !== '-') {
      e.preventDefault();
    } else {
      onKeyPress?.();
    }
  };

  const handleSubmit = () => {
    if (value.trim()) {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue)) {
        onSubmit(numValue);
      }
    }
  };

  // Prevenir que o botão roube o foco do input no mobile
  const handleButtonMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
  };

  return (
    <div className="relative flex flex-col items-center gap-4">
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => setValue(e.target.value.replace(/[^\d-]/g, ''))}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="?"
        className={cn(
          "w-48 md:w-64 text-center text-4xl md:text-6xl font-medium",
          "bg-transparent border-b-4 border-muted-foreground/30",
          "focus:border-primary focus:outline-none",
          "transition-all duration-200",
          "placeholder:text-muted-foreground/30",
          feedbackState === 'correct' && "border-success text-success",
          feedbackState === 'wrong' && "border-destructive text-destructive"
        )}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />
      
      {/* Mobile submit button - same width as input, below it */}
      <button
        onMouseDown={handleButtonMouseDown}
        onTouchStart={handleButtonMouseDown}
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        className={cn(
          "md:hidden w-48 py-3 rounded-lg transition-all duration-200",
          "flex items-center justify-center gap-2",
          "bg-primary text-primary-foreground font-medium",
          "hover:bg-primary/90 active:scale-95",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
        aria-label="Enviar resposta"
      >
        <CornerDownLeft className="w-5 h-5" />
        <span>Enter</span>
      </button>
      
      <p className="text-sm text-ghost hidden md:block">
        pressione enter
      </p>
    </div>
  );
}

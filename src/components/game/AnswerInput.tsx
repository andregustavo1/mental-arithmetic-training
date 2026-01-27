import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

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

  // Clear input and refocus after feedback
  useEffect(() => {
    if (feedbackState !== 'idle') {
      const timer = setTimeout(() => {
        setValue('');
        inputRef.current?.focus();
      }, 200);
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

  return (
    <div className="relative">
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
      <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm text-ghost">
        pressione enter
      </p>
    </div>
  );
}

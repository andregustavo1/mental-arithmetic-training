import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface AnswerInputProps {
  onSubmit: (answer: number) => void;
  disabled?: boolean;
  feedbackState: 'idle' | 'correct' | 'wrong';
  onKeyPress?: () => void;
  isBossMode?: boolean;
  targetLength?: number;
}

export function AnswerInput({
  onSubmit,
  disabled,
  feedbackState,
  onKeyPress,
  isBossMode = false,
  targetLength,
}: AnswerInputProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep focus on the input at all times
  useEffect(() => {
    inputRef.current?.focus();
  }, [disabled, feedbackState]);

  // Clear input immediately when feedback starts
  useEffect(() => {
    if (feedbackState !== 'idle') {
      setValue('');
    }
  }, [feedbackState]);

  // Prevent blur on mobile — re-grab focus if lost
  const handleBlur = () => {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled || feedbackState !== 'idle') {
      e.preventDefault();
      return;
    }
    if (e.key === 'Enter' && value.trim()) {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue)) {
        onSubmit(numValue);
      }
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      // Allow backspace/delete
    } else if (!/^\d$/.test(e.key) && e.key !== '-') {
      e.preventDefault();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || feedbackState !== 'idle') {
      // Reset value to empty to discard any typed chars during feedback
      setValue('');
      return;
    }

    const newValue = e.target.value.replace(/[^\d-]/g, '');
    setValue(newValue);
    onKeyPress?.();

    if (targetLength && targetLength > 0 && newValue.length >= targetLength) {
      const numValue = parseInt(newValue, 10);
      if (!isNaN(numValue)) {
        onSubmit(numValue);
      }
    }
  };

  return (
    <div className="relative flex flex-col items-center gap-4">
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        name="math_answer_field"
        id="math_answer_field"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        readOnly={disabled && feedbackState === 'idle'}
        placeholder="?"
        className={cn(
          "w-48 md:w-64 text-center text-4xl md:text-6xl font-medium",
          "bg-transparent border-b-4 border-muted-foreground/30",
          isBossMode ? "focus:border-destructive focus:outline-none" : "focus:border-primary focus:outline-none",
          "transition-all duration-200",
          "placeholder:text-muted-foreground/30",
          feedbackState === 'correct' && "border-success text-success",
          feedbackState === 'wrong' && "border-destructive text-destructive"
        )}
        autoComplete="one-time-code"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        data-lpignore="true"
        data-1p-ignore="true"
        data-form-type="other"
      />
    </div>
  );
}


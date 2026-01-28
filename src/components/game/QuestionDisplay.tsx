import { useState, useEffect } from 'react';
import { Question } from '@/types/game';
import { cn } from '@/lib/utils';

interface QuestionDisplayProps {
  question: Question;
  feedbackState: 'idle' | 'correct' | 'wrong';
}

export function QuestionDisplay({ question, feedbackState }: QuestionDisplayProps) {
  const [animate, setAnimate] = useState(false);
  
  // Anima quando a pergunta muda
  useEffect(() => {
    setAnimate(false);
    const timer = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setAnimate(true);
      });
    });
    return () => cancelAnimationFrame(timer);
  }, [question.x1, question.x2, question.operation]);

  return (
    <div className="flex items-center justify-center gap-4 text-5xl md:text-7xl font-medium tracking-tight">
      <span
        className={cn(
          "transition-all duration-300",
          animate && feedbackState === 'idle' && "animate-number-pop",
          feedbackState === 'correct' && "glow-success text-success",
          feedbackState === 'wrong' && "glow-error text-destructive",
          feedbackState === 'idle' && "text-highlight"
        )}
      >
        {question.x1.toLocaleString()}
      </span>
      <span className="text-primary">{question.displayOperation}</span>
      <span
        className={cn(
          "transition-all duration-300",
          animate && feedbackState === 'idle' && "animate-number-pop",
          feedbackState === 'correct' && "glow-success text-success",
          feedbackState === 'wrong' && "glow-error text-destructive",
          feedbackState === 'idle' && "text-highlight"
        )}
      >
        {question.x2.toLocaleString()}
      </span>
      <span className="text-dim">=</span>
      <span className="text-ghost">?</span>
    </div>
  );
}

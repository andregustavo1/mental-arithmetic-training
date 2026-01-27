import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface FeedbackMessageProps {
  isCorrect: boolean;
  correctAnswer?: number;
  show: boolean;
}

export function FeedbackMessage({ isCorrect, correctAnswer, show }: FeedbackMessageProps) {
  if (!show) return null;

  return (
    <div 
      className={cn(
        "flex items-center gap-3 px-6 py-3 rounded-lg font-medium text-lg",
        "animate-[fade-in_0.2s_ease-out]",
        isCorrect 
          ? "bg-success/20 text-success" 
          : "bg-destructive/20 text-destructive"
      )}
    >
      {isCorrect ? (
        <>
          <Check className="w-6 h-6" />
          <span>Correto</span>
        </>
      ) : (
        <span className="text-highlight">
          Resposta: <span className="text-highlight font-bold">{correctAnswer}</span>
        </span>
      )}
    </div>
  );
}

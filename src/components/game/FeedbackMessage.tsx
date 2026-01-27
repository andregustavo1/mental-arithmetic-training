import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

interface FeedbackMessageProps {
  isCorrect: boolean;
  correctAnswer?: number;
  show: boolean;
}

const correctMessages = [
  "Correto!",
  "Muito bem!",
  "Excelente!",
  "Perfeito!",
  "Isso aí!",
];

const wrongMessages = [
  "Incorreto",
  "Tente novamente",
  "Quase lá",
];

export function FeedbackMessage({ isCorrect, correctAnswer, show }: FeedbackMessageProps) {
  if (!show) return null;

  const message = isCorrect 
    ? correctMessages[Math.floor(Math.random() * correctMessages.length)]
    : wrongMessages[Math.floor(Math.random() * wrongMessages.length)];

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
        <Check className="w-6 h-6" />
      ) : (
        <X className="w-6 h-6" />
      )}
      <span>{message}</span>
      {!isCorrect && correctAnswer !== undefined && (
        <span className="ml-2 text-muted-foreground">
          Resposta: <span className="text-highlight">{correctAnswer}</span>
        </span>
      )}
    </div>
  );
}

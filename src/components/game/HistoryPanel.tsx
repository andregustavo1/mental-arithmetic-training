import { QuestionResult } from '@/types/game';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface HistoryPanelProps {
  results: QuestionResult[];
}

const OPERATION_SYMBOLS: Record<string, string> = {
  addition: '+',
  subtraction: '−',
  multiplication: '×',
  division: '÷',
};

export function HistoryPanel({ results }: HistoryPanelProps) {
  if (results.length === 0) {
    return (
      <div className="text-center text-ghost text-sm py-4">
        Nenhuma resposta ainda
      </div>
    );
  }

  // Show most recent first
  const reversedResults = [...results].reverse();

  return (
    <ScrollArea className="h-48 w-full">
      <div className="space-y-2 pr-4">
        {reversedResults.map((result, index) => {
          const symbol = OPERATION_SYMBOLS[result.question.operation];
          const expression = `${result.question.x1} ${symbol} ${result.question.x2}`;
          
          return (
            <div
              key={results.length - 1 - index}
              className={cn(
                "flex items-center justify-between px-4 py-2 rounded-lg border transition-all",
                result.isCorrect
                  ? "border-success/50 bg-success/10"
                  : "border-destructive/50 bg-destructive/10"
              )}
            >
              <span className="font-mono text-sm text-highlight">
                {expression} = 
              </span>
              
              <div className="flex items-center gap-3">
                <span className={cn(
                  "font-mono text-sm",
                  result.isCorrect ? "text-success" : "text-destructive line-through"
                )}>
                  {result.userAnswer}
                </span>
                
                {!result.isCorrect && (
                  <span className="font-mono text-sm text-success">
                    {result.question.answer}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

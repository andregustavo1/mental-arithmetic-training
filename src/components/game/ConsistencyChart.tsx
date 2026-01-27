import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { QuestionResult } from '@/types/game';

interface ConsistencyChartProps {
  results: QuestionResult[];
}

export function ConsistencyChart({ results }: ConsistencyChartProps) {
  const chartData = useMemo(() => {
    if (results.length === 0) return [];
    
    // Group into chunks of 5 for smoother visualization
    const chunkSize = Math.max(1, Math.floor(results.length / 20));
    const chunks: { index: number; avgTime: number; correct: number }[] = [];
    
    for (let i = 0; i < results.length; i += chunkSize) {
      const chunk = results.slice(i, i + chunkSize);
      const avgTime = chunk.reduce((sum, r) => sum + r.timeMs, 0) / chunk.length;
      const correct = chunk.filter(r => r.isCorrect).length;
      chunks.push({
        index: chunks.length + 1,
        avgTime: Math.round(avgTime),
        correct,
      });
    }
    
    return chunks;
  }, [results]);

  const avgTime = useMemo(() => {
    if (results.length === 0) return 0;
    return results.reduce((sum, r) => sum + r.timeMs, 0) / results.length;
  }, [results]);

  if (results.length < 5) {
    return (
      <div className="text-center text-ghost py-8">
        Responda pelo menos 5 questões para ver o gráfico
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <XAxis 
            dataKey="index" 
            stroke="hsl(var(--muted-foreground))"
            tickLine={false}
            axisLine={false}
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            tickLine={false}
            axisLine={false}
            fontSize={12}
            tickFormatter={(value) => `${(value / 1000).toFixed(1)}s`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--popover-foreground))',
            }}
            labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
            formatter={(value: number) => [`${(value / 1000).toFixed(2)}s`, 'Tempo médio']}
            labelFormatter={(label) => `Bloco ${label}`}
          />
          <ReferenceLine 
            y={avgTime} 
            stroke="hsl(var(--primary))" 
            strokeDasharray="5 5" 
            strokeOpacity={0.5}
          />
          <Line
            type="monotone"
            dataKey="avgTime"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

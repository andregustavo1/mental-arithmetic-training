import React from 'react';
import { cn } from '@/lib/utils';

interface BossIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  className?: string;
  size?: number | string;
}

export function BossIcon({ className = "w-6 h-6", size, style, ...props }: BossIconProps) {
  return (
    <span
      aria-label="Boss"
      role="img"
      className={cn("inline-block bg-current", className)}
      style={{
        WebkitMaskImage: "url('/boss_icon.png')",
        maskImage: "url('/boss_icon.png')",
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
        width: size,
        height: size,
        ...style,
      }}
      {...props}
    />
  );
}

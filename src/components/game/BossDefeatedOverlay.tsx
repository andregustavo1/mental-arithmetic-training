import { useEffect, useRef } from 'react';
import { BossIcon } from '@/components/ui/BossIcon';
import { Trophy, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BossDefeatedOverlayProps {
  bossNumber: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  rotation: number;
  vRot: number;
  gravity: number;
  drag: number;
  shape: 'circle' | 'spark' | 'shard';
}

const GOLD_COLORS = [
  '#ffffff',
  '#fef08a', // yellow-200
  '#fde047', // yellow-300
  '#facc15', // yellow-400
  '#fbbf24', // amber-400
  '#f59e0b', // amber-500
  '#d97706', // amber-600
];

export function BossDefeatedOverlay({ bossNumber }: BossDefeatedOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize and run physics particle simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions to window size
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const centerX = width / 2;
    const centerY = height * 0.42;

    const particles: Particle[] = [];
    const particleCount = 75;

    // Create physics particles exploding outward from center
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 14 + 4; // Initial velocity magnitude
      const shapes: Array<'circle' | 'spark' | 'shard'> = ['circle', 'spark', 'shard'];
      
      particles.push({
        x: centerX + (Math.random() * 20 - 10),
        y: centerY + (Math.random() * 20 - 10),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (Math.random() * 3), // slight upward bias
        size: Math.random() * 6 + 3,
        color: GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)],
        alpha: 1,
        decay: Math.random() * 0.015 + 0.01,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        gravity: 0.28,
        drag: 0.975,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      });
    }

    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      let aliveCount = 0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (p.alpha <= 0) continue;

        aliveCount++;

        // Apply physics
        p.vy += p.gravity;
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;
        p.alpha = Math.max(0, p.alpha - p.decay);

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'spark') {
          ctx.fillRect(-p.size * 1.5, -p.size / 3, p.size * 3, p.size / 1.5);
        } else {
          // Shard (diamond)
          ctx.beginPath();
          ctx.moveTo(0, -p.size);
          ctx.lineTo(p.size / 2, 0);
          ctx.lineTo(0, p.size);
          ctx.lineTo(-p.size / 2, 0);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      }

      if (aliveCount > 0) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none overflow-hidden">
      {/* 1. Quick White/Gold Impact Flash Overlay */}
      <div className="fixed inset-0 bg-amber-100/70 z-50 animate-flash-overlay pointer-events-none" />

      {/* 2. Physics Canvas for Particle Explosion */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-20 pointer-events-none"
      />

      {/* 3. Screen Impact Shake Container */}
      <div className="relative flex flex-col items-center justify-center animate-screen-impact z-30">
        
        {/* Sliced Skull Container */}
        <div className="relative w-40 h-40 md:w-48 md:h-48 flex items-center justify-center">
          
          {/* Diagonal Slash Light Beam */}
          <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
            <div className="w-[450px] h-[8px] bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_30px_#fde047] animate-slash-beam" />
          </div>

          {/* Top Sliced Skull Half */}
          <div 
            className="absolute inset-0 z-10 animate-skull-top"
            style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 46%, 0% 58%)' }}
          >
            <BossIcon className="w-full h-full text-destructive red-glow" />
          </div>

          {/* Bottom Sliced Skull Half */}
          <div 
            className="absolute inset-0 z-10 animate-skull-bottom"
            style={{ clipPath: 'polygon(0% 58%, 100% 46%, 100% 100%, 0% 100%)' }}
          >
            <BossIcon className="w-full h-full text-destructive red-glow" />
          </div>
        </div>

        {/* Golden Victory Typography & Badge */}
        <div className="mt-4 flex flex-col items-center gap-2 animate-gold-victory z-40">
          <div className="px-4 py-1 rounded-full bg-destructive/10 border border-destructive/50 text-destructive font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            <span>Chefe Derrotado</span>
          </div>

          <h2 className="text-3xl md:text-5xl font-black  text-destructive tracking-tight uppercase text-center">
            BOSS #{bossNumber} DERROTADO!
          </h2>

          <p className="text-sm font-semibold text-white tracking-wider">
            CAÇADA CONCLUÍDA!
          </p>
        </div>
      </div>
    </div>
  );
}

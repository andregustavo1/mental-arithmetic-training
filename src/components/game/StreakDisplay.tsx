import { useEffect, useMemo, useState, useRef } from 'react';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { loadEmittersPlugin } from '@tsparticles/plugin-emitters';
import type { Container } from '@tsparticles/engine';

interface StreakDisplayProps {
  streak: number;
  animate?: boolean;
}

type FireColor = 'yellow' | 'orange' | 'red' | 'blue' | 'purple' | 'none';

// Cores mudam a cada 5 acertos seguidos
function getFireColor(streak: number): FireColor {
  if (streak >= 20) return 'purple';
  if (streak >= 15) return 'blue';
  if (streak >= 10) return 'red';
  if (streak >= 5) return 'orange';
  if (streak >= 1) return 'yellow';
  return 'none';
}

function getStreakClass(streak: number): string {
  if (streak >= 20) return 'fire-purple';
  if (streak >= 15) return 'fire-blue';
  if (streak >= 10) return 'fire-red';
  if (streak >= 5) return 'fire-orange';
  if (streak >= 1) return 'fire-yellow';
  return 'text-ghost';
}

function getAuraClass(color: FireColor): string {
  switch (color) {
    case 'yellow': return 'flame-aura-yellow';
    case 'orange': return 'flame-aura-orange';
    case 'red': return 'flame-aura-red';
    case 'blue': return 'flame-aura-blue';
    case 'purple': return 'flame-aura-purple';
    default: return '';
  }
}

function getParticleColors(color: FireColor): string[] {
  switch (color) {
    case 'yellow': return ['#f5c542', '#ffdd57', '#ffeaa7'];
    case 'orange': return ['#f39c12', '#e67e22', '#ff9f43'];
    case 'red': return ['#e74c3c', '#ff6b6b', '#ee5a24'];
    case 'blue': return ['#3498db', '#74b9ff', '#0984e3'];
    case 'purple': return ['#9b59b6', '#a55eea', '#8e44ad'];
    default: return ['#888888'];
  }
}

function getEmitRate(color: FireColor): { delay: number; quantity: number } {
  switch (color) {
    // Menos exagerado: ainda contínuo, mas com menos partículas.
    case 'yellow': return { delay: 0.14, quantity: 1 };
    case 'orange': return { delay: 0.12, quantity: 1 };
    case 'red': return { delay: 0.11, quantity: 1 };
    case 'blue': return { delay: 0.10, quantity: 1 };
    case 'purple': return { delay: 0.09, quantity: 2 };
    default: return { delay: 0.14, quantity: 1 };
  }
}

function getParticleSpeed(color: FireColor): { min: number; max: number } {
  switch (color) {
    case 'yellow': return { min: 0.28, max: 0.75 };
    case 'orange': return { min: 0.35, max: 0.9 };
    case 'red': return { min: 0.42, max: 1.05 };
    case 'blue': return { min: 0.5, max: 1.2 };
    case 'purple': return { min: 0.58, max: 1.35 };
    default: return { min: 0.28, max: 0.75 };
  }
}

function getParticleLimit(color: FireColor): number {
  switch (color) {
    case 'yellow': return 60;
    case 'orange': return 60;
    case 'red': return 60;
    case 'blue': return 60;
    case 'purple': return 60;
    default: return 0;
  }
}

export function StreakDisplay({ streak, animate }: StreakDisplayProps) {
  const [init, setInit] = useState(false);
  const containerRef = useRef<Container | null>(null);
  const colorClass = getStreakClass(streak);
  const fireColor = getFireColor(streak);
  const auraClass = getAuraClass(fireColor);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
      await loadEmittersPlugin(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  // Atualizar cores e configurações quando fireColor mudar sem recriar o componente
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const emitters = container.plugins.get('emitters') as any;
      
      if (emitters && emitters.array && emitters.array[0]) {
        const emitter = emitters.array[0];
        const rate = getEmitRate(fireColor);
        emitter.options.rate.delay = rate.delay;
        emitter.options.rate.quantity = rate.quantity;
      }

      // Reaplica as novas opções (particlesOptions) quando o nível muda
      void container.refresh();
    }
  }, [fireColor]);

  const particlesLoaded = async (container?: Container) => {
    containerRef.current = container || null;
  };

  const particlesOptions = useMemo(() => {
    const speed = getParticleSpeed(fireColor);
    const rate = getEmitRate(fireColor);
    const limit = getParticleLimit(fireColor);
    
    return {
      fullScreen: { enable: false },
      fpsLimit: 60,
      particles: {
        number: {
          value: 0, // Partículas criadas apenas pelo emitter
          limit: { value: limit },
        },
        color: {
          value: getParticleColors(fireColor),
        },
        shape: {
          type: 'circle',
        },
        opacity: {
          value: { min: 1.0, max: 0.0 },
          animation: {
            enable: true,
            speed: 1.0,
            startValue: 'max' as const,
            destroy: 'min' as const,
          },
        },
        size: {
          value: { min: 1, max: 2.2 },
        },
        life: {
          // Vida curta para morrer antes de chegar no topo
          duration: {
            sync: false,
            value: { min: 1.2, max: 1.5 },
          },
          count: 1,
        },
        move: {
          enable: true,
          direction: 'top' as const,
          speed: speed,
          random: true,
          straight: false,
          outModes: {
            default: 'destroy' as const,
          },
          drift: {
            min: -0.25,
            max: 0.25,
          },
        },
      },
      emitters: {
        autoPlay: true,
        direction: 'top' as const,
        position: {
          x: 50,
          // Começa do meio do ícone
          y: 50,
        },
        size: {
          width: 40,
          height: 0,
        },
        rate: rate,
        life: {
          duration: 0, // Infinito
          count: 0, // Infinito
        },
        spawnColor: {
          value: getParticleColors(fireColor),
        },
      },
      detectRetina: true,
    };
  }, [fireColor]);

  if (streak === 0) {
    return (
      <div className="flex items-center gap-2 text-ghost">
        <Flame className="w-6 h-6" />
        <span className="text-2xl font-medium">0</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", colorClass)}>
      <div className={cn("relative", auraClass)} style={{ width: 24, height: 24 }}>
        {/* Particle effects com tsparticles */}
        {init && fireColor !== 'none' && (
          <Particles
            id="flame-particles"
            options={particlesOptions}
            particlesLoaded={particlesLoaded}
            className="absolute -inset-x-3 -top-6 -bottom-1 z-0 pointer-events-none"
          />
        )}
        <Flame 
          className={cn(
            "w-6 h-6 relative z-10 transition-all duration-300",
            animate && "streak-pulse"
          )} 
        />
      </div>
      <span 
        className={cn(
          "text-2xl font-bold transition-all duration-300",
          animate && "streak-pulse"
        )}
      >
        {streak}
      </span>
    </div>
  );
}

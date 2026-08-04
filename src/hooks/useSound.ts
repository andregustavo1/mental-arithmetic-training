import { useCallback, useRef, useEffect } from 'react';

// Create audio context lazily to avoid browser autoplay restrictions
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) {
  try {
    const ctx = getAudioContext();
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('Audio playback failed:', e);
  }
}

export function useGameSounds(enabled: boolean) {
  const canPlayRef = useRef(false);

  // Enable audio after first user interaction
  useEffect(() => {
    const enableAudio = () => {
      canPlayRef.current = true;
      // Resume audio context if suspended
      if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
      }
    };

    document.addEventListener('click', enableAudio, { once: true });
    document.addEventListener('keydown', enableAudio, { once: true });

    return () => {
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('keydown', enableAudio);
    };
  }, []);

  const playCorrect = useCallback(() => {
    if (!enabled || !canPlayRef.current) return;
    
    // Pleasant rising chord
    playTone(523.25, 0.15, 'sine', 0.2); // C5
    setTimeout(() => playTone(659.25, 0.15, 'sine', 0.2), 50); // E5
    setTimeout(() => playTone(783.99, 0.2, 'sine', 0.25), 100); // G5
  }, [enabled]);

  const playWrong = useCallback(() => {
    if (!enabled || !canPlayRef.current) return;
    
    // Low buzzer
    playTone(150, 0.2, 'sawtooth', 0.15);
  }, [enabled]);

  const playStreak = useCallback((streak: number) => {
    if (!enabled || !canPlayRef.current) return;
    
    // Escalating celebration based on streak
    const baseFreq = 440 + (Math.min(streak, 100) * 3);
    playTone(baseFreq, 0.1, 'sine', 0.15);
    setTimeout(() => playTone(baseFreq * 1.25, 0.1, 'sine', 0.2), 50);
    setTimeout(() => playTone(baseFreq * 1.5, 0.15, 'sine', 0.25), 100);
  }, [enabled]);

  const playKeypress = useCallback(() => {
    if (!enabled || !canPlayRef.current) return;
    
    playTone(800, 0.03, 'sine', 0.05);
  }, [enabled]);

  const playBossIncoming = useCallback(() => {
    if (!enabled || !canPlayRef.current) return;
    playTone(110, 0.3, 'sawtooth', 0.25);
    setTimeout(() => playTone(130.81, 0.4, 'sawtooth', 0.2), 100);
    setTimeout(() => playTone(155.56, 0.5, 'sawtooth', 0.2), 200);
    setTimeout(() => playTone(110, 0.6, 'sine', 0.3), 300);
  }, [enabled]);

  const playBossDefeated = useCallback(() => {
    if (!enabled || !canPlayRef.current) return;
    playTone(523.25, 0.15, 'sine', 0.25);
    setTimeout(() => playTone(659.25, 0.15, 'sine', 0.25), 80);
    setTimeout(() => playTone(783.99, 0.15, 'sine', 0.25), 160);
    setTimeout(() => playTone(1046.50, 0.3, 'sine', 0.3), 240);
  }, [enabled]);

  const playGameOver = useCallback(() => {
    if (!enabled || !canPlayRef.current) return;
    playTone(440, 0.2, 'sine', 0.2);
    setTimeout(() => playTone(392, 0.2, 'sine', 0.2), 150);
    setTimeout(() => playTone(349.23, 0.2, 'sine', 0.2), 300);
    setTimeout(() => playTone(293.66, 0.4, 'sawtooth', 0.15), 450);
  }, [enabled]);

  const playTimerTick = useCallback(() => {
    if (!enabled || !canPlayRef.current) return;
    playTone(600, 0.05, 'sine', 0.1);
  }, [enabled]);

  const playTimerUrgent = useCallback(() => {
    if (!enabled || !canPlayRef.current) return;
    playTone(800, 0.08, 'square', 0.15);
    setTimeout(() => playTone(800, 0.08, 'square', 0.12), 100);
  }, [enabled]);

  return {
    playCorrect,
    playWrong,
    playStreak,
    playKeypress,
    playBossIncoming,
    playBossDefeated,
    playGameOver,
    playTimerTick,
    playTimerUrgent,
  };
}

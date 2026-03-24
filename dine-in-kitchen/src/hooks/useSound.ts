import { useState, useCallback, useRef } from 'react';

export function useSound() {
  const [muted, setMuted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  const play = useCallback(() => {
    if (muted) return;

    try {
      const ctx = getAudioContext();

      // Play two quick beeps
      const playBeep = (startTime: number, frequency: number, duration: number) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        gainNode.gain.value = 0.3;
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      const now = ctx.currentTime;
      playBeep(now, 880, 0.15); // A5
      playBeep(now + 0.2, 1100, 0.15); // ~C#6
      playBeep(now + 0.4, 1320, 0.2); // E6
    } catch {
      // Silently fail if audio isn't available
    }
  }, [muted, getAudioContext]);

  const toggleMute = useCallback(() => setMuted((prev) => !prev), []);

  return { play, muted, toggleMute };
}
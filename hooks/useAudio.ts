import { useRef, useCallback } from 'react';
import { SoundType } from '../types';

// Use a singleton pattern for the AudioContext
let audioCtx: AudioContext | null = null;
const getAudioContext = () => {
  if (!audioCtx) {
    // Check if running in a browser environment
    // FIX: Cast window to any to support vendor-prefixed webkitAudioContext for Safari
    if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }
  return audioCtx;
};

export const useAudio = (isMuted: boolean) => {
  const isInitialized = useRef(false);

  const playSound = useCallback((type: SoundType) => {
    if (isMuted) return;

    const ctx = getAudioContext();
    if (!ctx) return;
    
    // Resume context on the first user interaction
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    isInitialized.current = true;

    let oscillator: OscillatorNode;
    let gainNode: GainNode;

    try {
        oscillator = ctx.createOscillator();
        gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        gainNode.gain.setValueAtTime(0, ctx.currentTime);

        switch (type) {
        case 'complete':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(600, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
            oscillator.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
            break;
        case 'reward':
            // A quick arpeggio
            const rewardNotes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            gainNode.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.01);
            rewardNotes.forEach((freq, i) => {
                oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
            });
            gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
            break;
        case 'send':
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(300, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.01);
            oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
            break;
        case 'click':
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(880, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
            break;
        case 'start':
            // Upward chord
            const startNotes = [523.25, 659.25, 783.99]; // C major
            startNotes.forEach(freq => {
                const osc = ctx.createOscillator();
                const gn = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime);
                gn.gain.setValueAtTime(0, ctx.currentTime);
                gn.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.01);
                gn.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
                osc.connect(gn);
                gn.connect(ctx.destination);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.4);
            });
            // no need for main oscillator
            return;
        case 'celebrate':
            // High pitched festive sound
            const celebNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5 to G6
            celebNotes.forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gn = ctx.createGain();
                osc.type = i % 2 === 0 ? 'sine' : 'triangle';
                osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.05);
                gn.gain.setValueAtTime(0, ctx.currentTime + i * 0.05);
                gn.gain.linearRampToValueAtTime(0.2, ctx.currentTime + i * 0.05 + 0.02);
                gn.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.05 + 0.4);
                osc.connect(gn);
                gn.connect(ctx.destination);
                osc.start(ctx.currentTime + i * 0.05);
                osc.stop(ctx.currentTime + i * 0.05 + 0.4);
            });
            return;
        }

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 1);
    } catch (e) {
        console.error("Error playing sound", e);
    }

  }, [isMuted]);

  // A function to initialize the context on a user gesture if it hasn't been played yet
  const initializeAudio = useCallback(() => {
      if (!isInitialized.current) {
          const ctx = getAudioContext();
          if (ctx && ctx.state === 'suspended') {
              ctx.resume();
          }
          isInitialized.current = true;
      }
  }, []);

  return { playSound, initializeAudio };
};

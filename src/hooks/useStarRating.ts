import { useMemo } from 'react';

export type RatingMode = 'easy' | 'standard' | 'strict';

interface StarRatingOptions {
  volume: number; // Average volume 0-1
  duration: number; // Speech duration in ms
  mode: RatingMode;
}

interface StarRatingResult {
  stars: 1 | 2 | 3;
  feedback: string;
}

const STORAGE_KEY = 'speakbuddy_rating_mode';

export function getRatingMode(): RatingMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'easy' || stored === 'standard' || stored === 'strict') {
      return stored;
    }
  } catch {}
  return 'easy'; // Default to easy mode for toddlers
}

export function setRatingMode(mode: RatingMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {}
}

export function calculateStarRating({ volume, duration, mode }: StarRatingOptions): StarRatingResult {
  // Normalize inputs
  const normalizedVolume = Math.min(Math.max(volume, 0), 1);
  const durationSeconds = duration / 1000;

  // Easy mode: always 3 stars (encouragement first)
  if (mode === 'easy') {
    return { stars: 3, feedback: '太棒了！' };
  }

  // Standard mode: based on volume and duration
  if (mode === 'standard') {
    let stars: 1 | 2 | 3 = 1;
    
    if (normalizedVolume >= 0.15 && durationSeconds >= 0.8) {
      stars = 3;
    } else if (normalizedVolume >= 0.08 && durationSeconds >= 0.5) {
      stars = 2;
    }
    
    const feedback = stars === 3 ? '太棒了！' : stars === 2 ? '很好！' : '加油！';
    return { stars, feedback };
  }

  // Strict mode: higher thresholds
  if (mode === 'strict') {
    let stars: 1 | 2 | 3 = 1;
    
    if (normalizedVolume >= 0.25 && durationSeconds >= 1.2) {
      stars = 3;
    } else if (normalizedVolume >= 0.15 && durationSeconds >= 0.8) {
      stars = 2;
    }
    
    const feedback = stars === 3 ? '太棒了！' : stars === 2 ? '不错！' : '再大声点！';
    return { stars, feedback };
  }

  return { stars: 3, feedback: '太棒了！' };
}

export function useStarRating() {
  const mode = useMemo(() => getRatingMode(), []);
  
  const calculate = (volume: number, duration: number): StarRatingResult => {
    return calculateStarRating({ volume, duration, mode });
  };

  return {
    mode,
    calculate,
    setMode: setRatingMode,
  };
}

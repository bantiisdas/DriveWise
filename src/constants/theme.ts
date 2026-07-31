import type { SafetyRating } from '@/src/types/drive';

export const RATING_COLORS: Record<SafetyRating, string> = {
  Excellent: '#22c55e',
  Good: '#84cc16',
  Fair: '#f59e0b',
  Poor: '#f97316',
  Critical: '#ef4444',
};

export function scoreColor(score: number): string {
  if (score >= 90) return RATING_COLORS.Excellent;
  if (score >= 75) return RATING_COLORS.Good;
  if (score >= 60) return RATING_COLORS.Fair;
  if (score >= 40) return RATING_COLORS.Poor;
  return RATING_COLORS.Critical;
}

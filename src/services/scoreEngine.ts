import {
  POINT_DEDUCTIONS,
  RATING_BANDS,
  STARTING_SCORE,
  EVENT_TYPES,
} from '@/src/constants/thresholds';
import type {
  DriveEvent,
  DriveEventType,
  EventBreakdown,
  SafetyRating,
} from '@/src/types/drive';
import { clamp } from '@/src/utils/math';

export function scoreFromEvents(events: DriveEvent[]): number {
  const deducted = events.reduce((sum, e) => sum + e.pointsDeducted, 0);
  return clamp(STARTING_SCORE - deducted, 0, STARTING_SCORE);
}

export function ratingFromScore(score: number): SafetyRating {
  for (const band of RATING_BANDS) {
    if (score >= band.min) return band.rating;
  }
  return 'Critical';
}

export function emptyBreakdown(): EventBreakdown {
  return EVENT_TYPES.reduce((acc, type) => {
    acc[type] = 0;
    return acc;
  }, {} as EventBreakdown);
}

export function breakdownFromEvents(events: DriveEvent[]): EventBreakdown {
  const breakdown = emptyBreakdown();
  for (const event of events) {
    breakdown[event.type] += 1;
  }
  return breakdown;
}

export function deductionFor(type: DriveEventType): number {
  return POINT_DEDUCTIONS[type];
}

export function compareSessions(
  current: { score: number; events: DriveEvent[] },
  previous: { score: number; events: DriveEvent[] } | null,
) {
  if (!previous) {
    return { scoreDelta: 0, eventDelta: 0, hasPrevious: false as const };
  }
  return {
    scoreDelta: current.score - previous.score,
    eventDelta: current.events.length - previous.events.length,
    hasPrevious: true as const,
  };
}

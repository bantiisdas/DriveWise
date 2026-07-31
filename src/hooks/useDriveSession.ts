import { useCallback, useEffect, useRef, useState } from 'react';

import { STARTING_SCORE } from '@/src/constants/thresholds';
import {
  createDetectorState,
  detectEvents,
} from '@/src/services/eventDetector';
import { saveSession } from '@/src/services/driveStorage';
import { ratingFromScore, scoreFromEvents } from '@/src/services/scoreEngine';
import { sensorManager } from '@/src/services/sensorManager';
import type { DriveEvent, DriveSession, SafetyRating } from '@/src/types/drive';
import { createId } from '@/src/utils/math';

export type DriveSessionState = {
  isActive: boolean;
  sessionId: string | null;
  startedAt: number | null;
  durationMs: number;
  events: DriveEvent[];
  score: number;
  rating: SafetyRating;
  error: string | null;
};

const initialState: DriveSessionState = {
  isActive: false,
  sessionId: null,
  startedAt: null,
  durationMs: 0,
  events: [],
  score: STARTING_SCORE,
  rating: 'Excellent',
  error: null,
};

export function useDriveSession() {
  const [state, setState] = useState<DriveSessionState>(initialState);
  const detectorRef = useRef(createDetectorState());
  const eventsRef = useRef<DriveEvent[]>([]);
  const startedAtRef = useRef<number | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTick = () => {
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };

  const startDrive = useCallback(async () => {
    if (sensorManager.isRunning()) {
      sensorManager.stop();
    }

    const id = createId('drive');
    const startedAt = Date.now();
    sessionIdRef.current = id;
    startedAtRef.current = startedAt;
    eventsRef.current = [];
    detectorRef.current = createDetectorState();

    setState({
      isActive: true,
      sessionId: id,
      startedAt,
      durationMs: 0,
      events: [],
      score: STARTING_SCORE,
      rating: 'Excellent',
      error: null,
    });

    clearTick();
    tickRef.current = setInterval(() => {
      if (!startedAtRef.current) return;
      setState((prev) => ({
        ...prev,
        durationMs: Date.now() - startedAtRef.current!,
      }));
    }, 1000);

    try {
      await sensorManager.start((sample) => {
        const detected = detectEvents(detectorRef.current, sample);
        if (detected.length === 0) return;

        eventsRef.current = [...eventsRef.current, ...detected];
        const score = scoreFromEvents(eventsRef.current);
        setState((prev) => ({
          ...prev,
          events: eventsRef.current,
          score,
          rating: ratingFromScore(score),
        }));
      });
    } catch (e) {
      setState((prev) => ({
        ...prev,
        error:
          e instanceof Error
            ? e.message
            : 'Failed to start sensors. Use a physical device for sensor data.',
      }));
    }
  }, []);

  const endDrive = useCallback(async (): Promise<DriveSession | null> => {
    sensorManager.stop();
    clearTick();

    const startedAt = startedAtRef.current;
    const sessionId = sessionIdRef.current;
    if (!startedAt || !sessionId) {
      setState(initialState);
      return null;
    }

    const endedAt = Date.now();
    const events = eventsRef.current;
    const score = scoreFromEvents(events);
    const session: DriveSession = {
      id: sessionId,
      startedAt,
      endedAt,
      durationMs: endedAt - startedAt,
      events,
      score,
      rating: ratingFromScore(score),
    };

    await saveSession(session);

    eventsRef.current = [];
    startedAtRef.current = null;
    sessionIdRef.current = null;

    setState({
      ...initialState,
      score: session.score,
      rating: session.rating,
      events: session.events,
      durationMs: session.durationMs,
    });

    return session;
  }, []);

  useEffect(() => {
    return () => {
      sensorManager.stop();
      clearTick();
    };
  }, []);

  return {
    ...state,
    startDrive,
    endDrive,
  };
}

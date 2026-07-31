import {
  DETECTION,
  EVENT_COOLDOWNS_MS,
  GRAVITY_MS2,
  POINT_DEDUCTIONS,
} from '@/src/constants/thresholds';
import type {
  DriveEvent,
  DriveEventType,
  EventSeverity,
  SensorSample,
} from '@/src/types/drive';
import { createId, magnitude, subtract, type Vec3 } from '@/src/utils/math';

type DetectorState = {
  lastUserAccel: Vec3 | null;
  lastOrientation: { beta: number; gamma: number } | null;
  lastMagMag: number | null;
  lastYawSign: number | null;
  lastYawFlipAt: number;
  lastEventAt: Partial<Record<DriveEventType, number>>;
};

export function createDetectorState(): DetectorState {
  return {
    lastUserAccel: null,
    lastOrientation: null,
    lastMagMag: null,
    lastYawSign: null,
    lastYawFlipAt: 0,
    lastEventAt: {},
  };
}

function canEmit(state: DetectorState, type: DriveEventType, now: number): boolean {
  const last = state.lastEventAt[type] ?? 0;
  return now - last >= EVENT_COOLDOWNS_MS[type];
}

function mark(state: DetectorState, type: DriveEventType, now: number) {
  state.lastEventAt[type] = now;
}

function makeEvent(
  type: DriveEventType,
  timestamp: number,
  severity: EventSeverity,
  meta?: Record<string, number>,
): DriveEvent {
  return {
    id: createId('evt'),
    type,
    timestamp,
    severity,
    pointsDeducted: POINT_DEDUCTIONS[type],
    meta,
  };
}

/**
 * Process one smoothed sensor sample and return zero or more detected events.
 * Mutates detector state for cooldowns and deltas.
 */
export function detectEvents(
  state: DetectorState,
  sample: SensorSample,
): DriveEvent[] {
  const events: DriveEvent[] = [];
  const now = sample.timestamp;
  const user = sample.userAccel;

  // Longitudinal axis: prefer Y (portrait phone upright in mount / pocket).
  // Delta of forward accel detects brake/accel pulses.
  if (state.lastUserAccel) {
    const deltaY = user.y - state.lastUserAccel.y;
    if (deltaY <= DETECTION.harshBrakeDelta && canEmit(state, 'harsh_brake', now)) {
      mark(state, 'harsh_brake', now);
      events.push(
        makeEvent('harsh_brake', now, 'high', { deltaY: round(deltaY) }),
      );
    } else if (
      deltaY >= DETECTION.harshAccelDelta &&
      canEmit(state, 'harsh_accel', now)
    ) {
      mark(state, 'harsh_accel', now);
      events.push(
        makeEvent('harsh_accel', now, 'high', { deltaY: round(deltaY) }),
      );
    }
  }
  state.lastUserAccel = user;

  const yaw = sample.gyro.z;
  const absYaw = Math.abs(yaw);

  if (absYaw >= DETECTION.aggressiveSteerYaw && canEmit(state, 'aggressive_steer', now)) {
    mark(state, 'aggressive_steer', now);
    events.push(
      makeEvent('aggressive_steer', now, 'high', { yaw: round(yaw) }),
    );
  } else if (absYaw >= DETECTION.sharpTurnYaw && canEmit(state, 'sharp_turn', now)) {
    mark(state, 'sharp_turn', now);
    events.push(makeEvent('sharp_turn', now, 'medium', { yaw: round(yaw) }));
  }

  // Rapid yaw sign flips → aggressive steering even if peaks are moderate.
  const yawSign = yaw === 0 ? 0 : yaw > 0 ? 1 : -1;
  if (
    state.lastYawSign &&
    yawSign &&
    yawSign !== state.lastYawSign &&
    absYaw >= DETECTION.sharpTurnYaw * 0.7
  ) {
    if (
      now - state.lastYawFlipAt <= DETECTION.aggressiveSteerFlipWindowMs &&
      canEmit(state, 'aggressive_steer', now)
    ) {
      mark(state, 'aggressive_steer', now);
      events.push(
        makeEvent('aggressive_steer', now, 'medium', { yawFlip: absYaw }),
      );
    }
    state.lastYawFlipAt = now;
  }
  if (yawSign !== 0) state.lastYawSign = yawSign;

  const accelG = magnitude(sample.accel) / GRAVITY_MS2;
  if (
    accelG >= DETECTION.excessiveMovementG &&
    canEmit(state, 'excessive_movement', now)
  ) {
    mark(state, 'excessive_movement', now);
    events.push(
      makeEvent('excessive_movement', now, 'medium', { g: round(accelG) }),
    );
  }

  // Possible phone handling: large orientation change + gyro spike,
  // optionally corroborated by magnetometer magnitude change.
  if (sample.orientation) {
    const { beta, gamma } = sample.orientation;
    if (state.lastOrientation) {
      const dBeta = Math.abs(beta - state.lastOrientation.beta);
      const dGamma = Math.abs(gamma - state.lastOrientation.gamma);
      const orientDelta = Math.max(dBeta, dGamma);
      const gyroMag = magnitude(sample.gyro);

      let magCorroborated = false;
      if (sample.magnetometer) {
        const magMag = magnitude(sample.magnetometer);
        if (
          state.lastMagMag != null &&
          Math.abs(magMag - state.lastMagMag) >= DETECTION.phoneHandlingMagDelta
        ) {
          magCorroborated = true;
        }
        state.lastMagMag = magMag;
      }

      const orientationHit = orientDelta >= DETECTION.phoneHandlingOrientationDeg;
      const gyroHit = gyroMag >= DETECTION.phoneHandlingGyro;
      if (
        orientationHit &&
        gyroHit &&
        canEmit(state, 'phone_handling', now)
      ) {
        mark(state, 'phone_handling', now);
        events.push(
          makeEvent('phone_handling', now, magCorroborated ? 'high' : 'medium', {
            orientDelta: round(orientDelta),
            gyroMag: round(gyroMag),
          }),
        );
      }
    }
    state.lastOrientation = { beta, gamma };
  } else if (sample.magnetometer) {
    state.lastMagMag = magnitude(sample.magnetometer);
  }

  return events;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Used by tests / debugging — expose subtract helper usage. */
export function accelDelta(prev: Vec3, next: Vec3): Vec3 {
  return subtract(next, prev);
}

import type { DriveEventType, SafetyRating } from '@/src/types/drive';

/** Sensor polling interval (~6–7 Hz) for battery efficiency. */
export const SENSOR_UPDATE_MS = 150;

/** Per-event cooldown so one physical action does not spam deductions. */
export const EVENT_COOLDOWNS_MS: Record<DriveEventType, number> = {
  harsh_brake: 2500,
  harsh_accel: 2500,
  sharp_turn: 2000,
  aggressive_steer: 2500,
  excessive_movement: 3000,
  phone_handling: 4000,
};

/**
 * Detection thresholds — tuned for handheld phone in a vehicle.
 * Documented in README.md as well.
 */
export const DETECTION = {
  /** Longitudinal user-accel Δ (m/s²) for harsh braking. */
  harshBrakeDelta: -3.5,
  /** Longitudinal user-accel Δ (m/s²) for harsh acceleration. */
  harshAccelDelta: 3.0,
  /** Sustained samples needed at ~150ms interval. */
  accelSustainSamples: 1,
  /** Gyroscope yaw |ωz| (rad/s) for sharp turn. */
  sharpTurnYaw: 2.0,
  /** Gyroscope yaw |ωz| (rad/s) for aggressive steering. */
  aggressiveSteerYaw: 2.8,
  /** Rapid yaw sign-flip window for aggressive steering. */
  aggressiveSteerFlipWindowMs: 800,
  /** Accel magnitude peak in g for excessive device movement. */
  excessiveMovementG: 1.8,
  /** Pitch/roll change (degrees) suggesting phone reorientation. */
  phoneHandlingOrientationDeg: 35,
  /** Gyro magnitude (rad/s) accompanying phone handling. */
  phoneHandlingGyro: 1.5,
  /** Magnetometer magnitude change corroborating phone handling. */
  phoneHandlingMagDelta: 25,
} as const;

export const POINT_DEDUCTIONS: Record<DriveEventType, number> = {
  harsh_brake: 5,
  harsh_accel: 5,
  sharp_turn: 3,
  aggressive_steer: 3,
  excessive_movement: 4,
  phone_handling: 10,
};

export const STARTING_SCORE = 100;

export const RATING_BANDS: { min: number; rating: SafetyRating }[] = [
  { min: 90, rating: 'Excellent' },
  { min: 75, rating: 'Good' },
  { min: 60, rating: 'Fair' },
  { min: 40, rating: 'Poor' },
  { min: 0, rating: 'Critical' },
];

export const EVENT_LABELS: Record<DriveEventType, string> = {
  harsh_brake: 'Harsh Braking',
  harsh_accel: 'Harsh Acceleration',
  sharp_turn: 'Sharp Turn',
  aggressive_steer: 'Aggressive Steering',
  excessive_movement: 'Excessive Device Movement',
  phone_handling: 'Possible Phone Handling',
};

export const EVENT_TYPES = Object.keys(POINT_DEDUCTIONS) as DriveEventType[];

export const GRAVITY_MS2 = 9.80665;

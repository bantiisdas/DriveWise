export type DriveEventType =
  | 'harsh_brake'
  | 'harsh_accel'
  | 'sharp_turn'
  | 'aggressive_steer'
  | 'excessive_movement'
  | 'phone_handling';

export type SafetyRating =
  | 'Excellent'
  | 'Good'
  | 'Fair'
  | 'Poor'
  | 'Critical';

export type EventSeverity = 'low' | 'medium' | 'high';

export type DriveEvent = {
  id: string;
  type: DriveEventType;
  timestamp: number;
  severity: EventSeverity;
  pointsDeducted: number;
  meta?: Record<string, number>;
};

export type DriveSession = {
  id: string;
  startedAt: number;
  endedAt?: number;
  durationMs: number;
  events: DriveEvent[];
  score: number;
  rating: SafetyRating;
};

export type SensorSample = {
  timestamp: number;
  accel: { x: number; y: number; z: number };
  gyro: { x: number; y: number; z: number };
  /** User acceleration when DeviceMotion provides it; falls back to accel. */
  userAccel: { x: number; y: number; z: number };
  orientation?: { alpha: number; beta: number; gamma: number };
  magnetometer?: { x: number; y: number; z: number };
};

export type EventBreakdown = Record<DriveEventType, number>;

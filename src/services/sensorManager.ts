import {
  Accelerometer,
  DeviceMotion,
  Gyroscope,
  Magnetometer,
  type AccelerometerMeasurement,
  type DeviceMotionMeasurement,
  type GyroscopeMeasurement,
  type MagnetometerMeasurement,
} from 'expo-sensors';

import { SENSOR_UPDATE_MS } from '@/src/constants/thresholds';
import type { SensorSample } from '@/src/types/drive';
import { ema, type Vec3 } from '@/src/utils/math';

export type SensorSampleHandler = (sample: SensorSample) => void;

type ListenerSub = { remove: () => void };

type RawBuffers = {
  accel: Vec3 | null;
  gyro: Vec3 | null;
  userAccel: Vec3 | null;
  orientation: { alpha: number; beta: number; gamma: number } | null;
  magnetometer: Vec3 | null;
};

const G = 9.80665;

/**
 * Centralized sensor subscriptions. Sensors only run while a drive is active.
 */
export class SensorManager {
  private subs: ListenerSub[] = [];
  private handler: SensorSampleHandler | null = null;
  private emitTimer: ReturnType<typeof setInterval> | null = null;
  private running = false;

  private smoothedAccel: Vec3 | null = null;
  private smoothedGyro: Vec3 | null = null;
  private smoothedUser: Vec3 | null = null;

  private raw: RawBuffers = {
    accel: null,
    gyro: null,
    userAccel: null,
    orientation: null,
    magnetometer: null,
  };

  async start(onSample: SensorSampleHandler): Promise<void> {
    if (this.running) {
      this.stop();
    }

    this.handler = onSample;
    this.running = true;
    this.resetBuffers();

    await Promise.all([
      Accelerometer.setUpdateInterval(SENSOR_UPDATE_MS),
      Gyroscope.setUpdateInterval(SENSOR_UPDATE_MS),
      DeviceMotion.setUpdateInterval(SENSOR_UPDATE_MS),
      Magnetometer.setUpdateInterval(SENSOR_UPDATE_MS),
    ]);

    this.subs.push(
      Accelerometer.addListener((data: AccelerometerMeasurement) => {
        // Accelerometer reports g-units; convert to m/s².
        this.raw.accel = {
          x: data.x * G,
          y: data.y * G,
          z: data.z * G,
        };
      }),
    );

    this.subs.push(
      Gyroscope.addListener((data: GyroscopeMeasurement) => {
        this.raw.gyro = { x: data.x, y: data.y, z: data.z };
      }),
    );

    this.subs.push(
      DeviceMotion.addListener((data: DeviceMotionMeasurement) => {
        if (data.acceleration) {
          this.raw.userAccel = {
            x: data.acceleration.x ?? 0,
            y: data.acceleration.y ?? 0,
            z: data.acceleration.z ?? 0,
          };
        }
        if (data.accelerationIncludingGravity && !this.raw.accel) {
          this.raw.accel = {
            x: data.accelerationIncludingGravity.x ?? 0,
            y: data.accelerationIncludingGravity.y ?? 0,
            z: data.accelerationIncludingGravity.z ?? 0,
          };
        }
        if (data.rotation) {
          this.raw.orientation = {
            alpha: radToDeg(data.rotation.alpha ?? 0),
            beta: radToDeg(data.rotation.beta ?? 0),
            gamma: radToDeg(data.rotation.gamma ?? 0),
          };
        }
        if (data.rotationRate && !this.raw.gyro) {
          this.raw.gyro = {
            x: data.rotationRate.alpha ?? 0,
            y: data.rotationRate.beta ?? 0,
            z: data.rotationRate.gamma ?? 0,
          };
        }
      }),
    );

    try {
      const magAvailable = await Magnetometer.isAvailableAsync();
      if (magAvailable) {
        this.subs.push(
          Magnetometer.addListener((data: MagnetometerMeasurement) => {
            this.raw.magnetometer = { x: data.x, y: data.y, z: data.z };
          }),
        );
      }
    } catch {
      // Magnetometer is optional.
    }

    this.emitTimer = setInterval(() => this.emitSample(), SENSOR_UPDATE_MS);
  }

  stop(): void {
    this.running = false;
    for (const sub of this.subs) {
      sub.remove();
    }
    this.subs = [];
    if (this.emitTimer) {
      clearInterval(this.emitTimer);
      this.emitTimer = null;
    }
    this.handler = null;
    this.resetBuffers();
  }

  isRunning(): boolean {
    return this.running;
  }

  private resetBuffers() {
    this.raw = {
      accel: null,
      gyro: null,
      userAccel: null,
      orientation: null,
      magnetometer: null,
    };
    this.smoothedAccel = null;
    this.smoothedGyro = null;
    this.smoothedUser = null;
  }

  private emitSample() {
    if (!this.handler || !this.running) return;
    if (!this.raw.accel && !this.raw.userAccel && !this.raw.gyro) return;

    const accelRaw = this.raw.accel ?? { x: 0, y: 0, z: 0 };
    const gyroRaw = this.raw.gyro ?? { x: 0, y: 0, z: 0 };
    const userRaw = this.raw.userAccel ?? accelRaw;

    this.smoothedAccel = ema(this.smoothedAccel, accelRaw);
    this.smoothedGyro = ema(this.smoothedGyro, gyroRaw);
    this.smoothedUser = ema(this.smoothedUser, userRaw);

    const sample: SensorSample = {
      timestamp: Date.now(),
      accel: this.smoothedAccel,
      gyro: this.smoothedGyro,
      userAccel: this.smoothedUser,
      orientation: this.raw.orientation ?? undefined,
      magnetometer: this.raw.magnetometer ?? undefined,
    };

    this.handler(sample);
  }
}

function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export const sensorManager = new SensorManager();

// Math utilities
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Easing functions
export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

export function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function easeIn(t: number): number {
  return t * t * t;
}

// Random utilities with seed support
export class SeededRandom {
  private seed: number;

  constructor(seed: number = 0) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  choice<T>(array: T[]): T | undefined {
    if (array.length === 0) return undefined;
    return array[this.int(0, array.length - 1)];
  }
}

// Vector utilities
export function normalizeVector(x: number, y: number): { x: number; y: number } {
  const length = Math.sqrt(x * x + y * y);
  if (length === 0) return { x: 0, y: 0 };
  return { x: x / length, y: y / length };
}

export function rotateVector(
  x: number,
  y: number,
  angle: number
): { x: number; y: number } {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: x * cos - y * sin,
    y: x * sin + y * cos,
  };
}

// Animation helpers
export function interpolatePosition(
  from: { x: number; y: number },
  to: { x: number; y: number },
  t: number
): { x: number; y: number } {
  return {
    x: lerp(from.x, to.x, t),
    y: lerp(from.y, to.y, t),
  };
}

// Physics helpers
export function applyGravity(
  vy: number,
  gravity: number,
  deltaTime: number = 1
): number {
  return vy + gravity * deltaTime;
}

export function projectilePosition(
  x0: number,
  y0: number,
  vx: number,
  vy: number,
  t: number,
  gravity: number = 0.9
): { x: number; y: number } {
  return {
    x: x0 + vx * t,
    y: y0 + vy * t + 0.5 * gravity * t * t,
  };
}
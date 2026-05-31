import { GAME_CONFIG } from "./constants";
import type { Arrow } from "./types";

export function normalizeAngle(angle: number): number {
  const twoPi = Math.PI * 2;
  return ((angle % twoPi) + twoPi) % twoPi;
}

export function angleDifference(a: number, b: number): number {
  const twoPi = Math.PI * 2;
  const na = normalizeAngle(a);
  const nb = normalizeAngle(b);
  const diff = Math.abs(na - nb);
  return Math.min(diff, twoPi - diff);
}

export function checkCollision(
  newAngle: number,
  existingArrows: Arrow[],
  threshold = GAME_CONFIG.COLLISION_THRESHOLD
): boolean {
  for (const arrow of existingArrows) {
    if (angleDifference(newAngle, arrow.angle) < threshold) {
      return true;
    }
  }
  return false;
}

export function computeHitAngle(targetAngle: number): number {
  return normalizeAngle(Math.PI / 2 - targetAngle);
}

import { GAME_CONFIG } from "./constants";
import { angleDifference } from "./collision";
import type { Arrow } from "./types";

export function generateObstacles(count: number): Arrow[] {
  const arrows: Arrow[] = [];
  let attempts = 0;

  while (arrows.length < count && attempts < 2000) {
    attempts += 1;
    const angle = Math.random() * Math.PI * 2;
    const tooClose = arrows.some(
      (arrow) => angleDifference(arrow.angle, angle) < GAME_CONFIG.MIN_ARROW_GAP
    );

    if (!tooClose) {
      arrows.push({
        id: crypto.randomUUID(),
        angle,
        isObstacle: true,
      });
    }
  }

  return arrows;
}

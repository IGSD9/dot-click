import { GAME_CONFIG } from "./constants";

export function getTimeLimit(successCount: number): number {
  return Math.max(
    GAME_CONFIG.MIN_TIME_MS,
    GAME_CONFIG.INITIAL_TIME_MS - successCount * GAME_CONFIG.TIME_DECREASE_MS
  );
}

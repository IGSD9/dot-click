import { getTimeLimit } from "@/lib/game/difficulty";
import { randomDotPosition, type PlayAreaBounds } from "@/lib/game/spawn";
import type { SurvivalState } from "@/lib/game/types";
import { GAME_CONFIG } from "./constants";

export function createSurvivalInitialState(): SurvivalState {
  return {
    phase: "ready",
    score: 0,
    misses: 0,
    dot: null,
    timeLimitMs: GAME_CONFIG.INITIAL_TIME_MS,
  };
}

export function startSurvivalGame(bounds: PlayAreaBounds): SurvivalState {
  return {
    phase: "playing",
    score: 0,
    misses: 0,
    dot: randomDotPosition(bounds),
    timeLimitMs: getTimeLimit(0),
  };
}

export function spawnSurvivalDot(
  state: SurvivalState,
  bounds: PlayAreaBounds
): SurvivalState {
  return {
    ...state,
    dot: randomDotPosition(bounds),
    timeLimitMs: getTimeLimit(state.score),
  };
}

export function handleSurvivalHit(state: SurvivalState): SurvivalState {
  const score = state.score + 1;
  return {
    ...state,
    score,
    timeLimitMs: getTimeLimit(score),
  };
}

export function handleSurvivalMiss(state: SurvivalState): SurvivalState {
  const misses = state.misses + 1;
  if (misses >= GAME_CONFIG.MAX_MISSES) {
    return {
      ...state,
      misses,
      phase: "gameover",
      dot: null,
    };
  }
  return { ...state, misses };
}

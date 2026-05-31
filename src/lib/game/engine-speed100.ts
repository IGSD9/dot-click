import { GAME_CONFIG } from "@/lib/game/constants";
import { randomDotPosition, type PlayAreaBounds } from "@/lib/game/spawn";
import type { Speed100State } from "@/lib/game/types";

export function createSpeed100InitialState(): Speed100State {
  return {
    phase: "ready",
    taps: 0,
    targetTaps: GAME_CONFIG.SPEED100_TARGET,
    dot: null,
    startedAt: null,
    elapsedMs: 0,
  };
}

export function startSpeed100Game(bounds: PlayAreaBounds): Speed100State {
  return {
    phase: "playing",
    taps: 0,
    targetTaps: GAME_CONFIG.SPEED100_TARGET,
    dot: randomDotPosition(bounds),
    startedAt: performance.now(),
    elapsedMs: 0,
  };
}

export function handleSpeed100Hit(
  state: Speed100State,
  bounds: PlayAreaBounds
): Speed100State {
  const taps = state.taps + 1;
  const startedAt = state.startedAt ?? performance.now();
  const elapsedMs = Math.round(performance.now() - startedAt);

  if (taps >= state.targetTaps) {
    return {
      ...state,
      taps,
      startedAt,
      elapsedMs,
      phase: "clear",
      dot: null,
    };
  }

  return {
    ...state,
    taps,
    startedAt,
    elapsedMs,
    dot: randomDotPosition(bounds),
  };
}

export function getSpeed100ElapsedMs(state: Speed100State): number {
  if (state.phase !== "playing" || state.startedAt === null) {
    return state.elapsedMs;
  }
  return performance.now() - state.startedAt;
}

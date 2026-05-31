export type GamePhase = "ready" | "playing" | "gameover" | "clear";

export type DotPosition = {
  x: number;
  y: number;
};

export type SurvivalState = {
  phase: "ready" | "playing" | "gameover";
  score: number;
  misses: number;
  dot: DotPosition | null;
  timeLimitMs: number;
};

export type Speed100State = {
  phase: "ready" | "playing" | "clear";
  taps: number;
  targetTaps: number;
  dot: DotPosition | null;
  startedAt: number | null;
  elapsedMs: number;
};

export type GameResult = {
  clicks: number;
};

export function formatElapsedSeconds(ms: number): string {
  return (ms / 1000).toFixed(2);
}

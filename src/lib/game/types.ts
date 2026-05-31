import type { StageConfig } from "./stages";

export type GamePhase = "idle" | "shooting" | "clear" | "gameover";

export type Arrow = {
  id: string;
  angle: number;
  isObstacle: boolean;
};

export type FlyingArrow = {
  x: number;
  y: number;
};

export type GameLayout = {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  targetRadius: number;
  shootY: number;
};

export type GameState = {
  phase: GamePhase;
  stage: number;
  streak: number;
  arrowsRemaining: number;
  targetAngle: number;
  rotationSpeed: number;
  rotationDirection: 1 | -1;
  frameCount: number;
  stuckArrows: Arrow[];
  flyingArrow: FlyingArrow | null;
  config: StageConfig;
};

export type GameResult = {
  stage: number;
  streak: number;
};

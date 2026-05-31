import { GAME_CONFIG } from "./constants";
import { checkCollision, computeHitAngle } from "./collision";
import { generateObstacles } from "./obstacles";
import { getStageConfig } from "./stages";
import type { GameLayout, GameState } from "./types";

export function getLayout(width: number, height: number): GameLayout {
  const targetRadius = Math.min(width, height) * GAME_CONFIG.TARGET_RADIUS_RATIO;
  const shootYOffset = Math.max(
    GAME_CONFIG.SHOOT_Y_MIN,
    height * GAME_CONFIG.SHOOT_Y_OFFSET_RATIO
  );

  return {
    width,
    height,
    centerX: width / 2,
    centerY: height * GAME_CONFIG.CENTER_Y_RATIO,
    targetRadius,
    shootY: height - shootYOffset,
  };
}

export function createInitialState(stage: number, streak = 0): GameState {
  const config = getStageConfig(stage);
  return {
    phase: "idle",
    stage,
    streak,
    arrowsRemaining: config.arrowsRequired,
    targetAngle: 0,
    rotationSpeed: config.rotationSpeed,
    rotationDirection: 1,
    frameCount: 0,
    stuckArrows: generateObstacles(config.initialObstacles),
    flyingArrow: null,
    config,
  };
}

function getEffectiveRotationSpeed(state: GameState): number {
  const { config, frameCount, rotationDirection } = state;
  let speed = config.rotationSpeed;

  if (config.speedVariance > 0) {
    speed += Math.sin(frameCount * 0.04) * config.speedVariance;
  }

  return speed * rotationDirection;
}

export function tick(state: GameState, layout: GameLayout): GameState {
  if (state.phase === "gameover" || state.phase === "clear") {
    return state;
  }

  const frameCount = state.frameCount + 1;
  let rotationDirection = state.rotationDirection;

  if (state.config.directionChange && frameCount % 180 === 0) {
    rotationDirection = rotationDirection === 1 ? -1 : 1;
  }

  const targetAngle =
    state.targetAngle + getEffectiveRotationSpeed({ ...state, rotationDirection });

  let next: GameState = {
    ...state,
    frameCount,
    rotationDirection,
    targetAngle,
  };

  if (!next.flyingArrow) {
    return next;
  }

  const flyingY = next.flyingArrow.y - GAME_CONFIG.ARROW_SPEED;
  const hitLine = layout.centerY + layout.targetRadius;

  if (flyingY > hitLine) {
    return { ...next, flyingArrow: { ...next.flyingArrow, y: flyingY } };
  }

  const hitAngle = computeHitAngle(next.targetAngle);

  if (checkCollision(hitAngle, next.stuckArrows)) {
    return {
      ...next,
      phase: "gameover",
      flyingArrow: null,
      streak: 0,
    };
  }

  const stuckArrows = [
    ...next.stuckArrows,
    { id: crypto.randomUUID(), angle: hitAngle, isObstacle: false },
  ];
  const arrowsRemaining = next.arrowsRemaining - 1;

  if (arrowsRemaining === 0) {
    return {
      ...next,
      phase: "clear",
      stuckArrows,
      flyingArrow: null,
      arrowsRemaining: 0,
      streak: next.streak + 1,
    };
  }

  return {
    ...next,
    phase: "idle",
    stuckArrows,
    flyingArrow: null,
    arrowsRemaining,
  };
}

export function shoot(state: GameState, layout: GameLayout): GameState {
  if (state.phase !== "idle" || state.flyingArrow) {
    return state;
  }

  return {
    ...state,
    phase: "shooting",
    flyingArrow: {
      x: layout.centerX,
      y: layout.shootY,
    },
  };
}

export function advanceStage(state: GameState): GameState {
  return createInitialState(state.stage + 1, state.streak);
}

export function retryStage(state: GameState): GameState {
  return createInitialState(state.stage, state.streak);
}

export function retryFromStageOne(): GameState {
  return createInitialState(1, 0);
}

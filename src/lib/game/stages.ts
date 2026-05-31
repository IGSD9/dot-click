export type StageConfig = {
  stage: number;
  arrowsRequired: number;
  initialObstacles: number;
  rotationSpeed: number;
  directionChange: boolean;
  speedVariance: number;
};

export function getStageConfig(stage: number): StageConfig {
  return {
    stage,
    arrowsRequired: 3 + Math.floor(stage / 3),
    initialObstacles: Math.min(Math.floor(stage / 5), 8),
    rotationSpeed: 0.02 + stage * 0.003,
    directionChange: stage >= 10,
    speedVariance: stage >= 15 ? 0.012 : 0,
  };
}

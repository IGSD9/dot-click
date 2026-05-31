import { GAME_CONFIG } from "./constants";
import type { GameLayout, GameState } from "./types";

function drawArrowShaft(
  ctx: CanvasRenderingContext2D,
  length: number,
  width: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-width / 2, 0);
  ctx.lineTo(-width / 2, length);
  ctx.lineTo(width / 2, length);
  ctx.lineTo(width / 2, 0);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-width, -width * 0.8);
  ctx.lineTo(width, -width * 0.8);
  ctx.closePath();
  ctx.fill();
}

function drawStuckArrow(
  ctx: CanvasRenderingContext2D,
  layout: GameLayout,
  angle: number,
  isObstacle: boolean
) {
  const { centerX, centerY, targetRadius } = layout;
  const color = isObstacle ? "#ef4444" : "#f8fafc";
  const length = Math.max(28, targetRadius * 0.85);
  const width = Math.max(5, targetRadius * 0.1);

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(angle);
  ctx.translate(targetRadius, 0);
  ctx.rotate(Math.PI / 2);
  drawArrowShaft(ctx, length, width, color);
  ctx.restore();
}

function drawFlyingArrow(
  ctx: CanvasRenderingContext2D,
  layout: GameLayout,
  x: number,
  y: number
) {
  const length = Math.max(32, layout.targetRadius * 0.9);
  const width = Math.max(5, layout.targetRadius * 0.1);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-Math.PI / 2);
  drawArrowShaft(ctx, length, width, "#e2e8f0");
  ctx.restore();
}

function drawTarget(
  ctx: CanvasRenderingContext2D,
  layout: GameLayout,
  targetAngle: number
) {
  const { centerX, centerY, targetRadius } = layout;

  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(targetAngle);

  ctx.beginPath();
  ctx.arc(0, 0, targetRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#334155";
  ctx.fill();
  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = Math.max(3, targetRadius * 0.06);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, targetRadius * 0.18, 0, Math.PI * 2);
  ctx.fillStyle = "#1e293b";
  ctx.fill();

  ctx.restore();
}

export function renderGame(
  ctx: CanvasRenderingContext2D,
  layout: GameLayout,
  state: GameState
) {
  const { width, height } = layout;

  ctx.clearRect(0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, "#0f172a");
  gradient.addColorStop(1, "#1e1b4b");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  if (state.flyingArrow) {
    drawFlyingArrow(
      ctx,
      layout,
      state.flyingArrow.x,
      state.flyingArrow.y
    );
  }

  drawTarget(ctx, layout, state.targetAngle);

  for (const arrow of state.stuckArrows) {
    drawStuckArrow(ctx, layout, arrow.angle, arrow.isObstacle);
  }
}

export function getShootHint(layout: GameLayout): { x: number; y: number } {
  return { x: layout.centerX, y: layout.shootY + GAME_CONFIG.ARROW_LENGTH * 0.3 };
}

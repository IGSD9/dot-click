import { GAME_CONFIG } from "./constants";
import type { DotPosition } from "./types";

export type ExcludeRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PlayAreaBounds = {
  width: number;
  height: number;
  topOffset: number;
  bottomOffset?: number;
  excludeRects?: ExcludeRect[];
};

function dotRect(x: number, y: number) {
  const size = GAME_CONFIG.DOT_SIZE;
  return { x, y, width: size, height: size };
}

function overlaps(
  a: { x: number; y: number; width: number; height: number },
  b: ExcludeRect
) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function isValidPosition(x: number, y: number, bounds: PlayAreaBounds) {
  if (!bounds.excludeRects?.length) return true;
  const rect = dotRect(x, y);
  return !bounds.excludeRects.some((zone) => overlaps(rect, zone));
}

export function randomDotPosition(bounds: PlayAreaBounds): DotPosition {
  const { DOT_SIZE, AREA_PADDING } = GAME_CONFIG;
  const bottomOffset = bounds.bottomOffset ?? GAME_CONFIG.BOTTOM_HINT_HEIGHT;

  const minX = AREA_PADDING;
  const minY = bounds.topOffset + AREA_PADDING;
  const maxX = bounds.width - AREA_PADDING - DOT_SIZE;
  const maxY = bounds.height - bottomOffset - DOT_SIZE;

  for (let i = 0; i < 200; i++) {
    const x = minX + Math.random() * Math.max(0, maxX - minX);
    const y = minY + Math.random() * Math.max(0, maxY - minY);
    if (isValidPosition(x, y, bounds)) {
      return { x, y };
    }
  }

  return {
    x: minX + Math.random() * Math.max(0, maxX - minX),
    y: minY + Math.random() * Math.max(0, maxY - minY),
  };
}

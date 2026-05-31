"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GAME_CONFIG } from "@/lib/game/constants";
import {
  createSpeed100InitialState,
  getSpeed100ElapsedMs,
  handleSpeed100Hit,
  startSpeed100Game,
} from "@/lib/game/engine-speed100";
import type { PlayAreaBounds } from "@/lib/game/spawn";
import type { Speed100State } from "@/lib/game/types";
import { GameOverlay } from "./GameOverlay";
import { Speed100HUD } from "./Speed100HUD";

export function Speed100GameScreen() {
  const areaRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLElement>(null);
  const playBoundsRef = useRef<PlayAreaBounds>({
    width: 360,
    height: 640,
    topOffset: GAME_CONFIG.HUD_FALLBACK_HEIGHT,
    excludeRects: [],
  });

  const [state, setState] = useState<Speed100State>(createSpeed100InitialState);
  const [elapsedMs, setElapsedMs] = useState(0);

  const measurePlayArea = useCallback(() => {
    const areaRect = areaRef.current?.getBoundingClientRect();
    if (!areaRect) return;

    const hudHeight =
      hudRef.current?.getBoundingClientRect().height ??
      GAME_CONFIG.HUD_FALLBACK_HEIGHT;

    const timerZone = hudRef.current?.querySelector("[data-timer-zone]");
    const excludeRects = [];

    if (timerZone) {
      const timerRect = timerZone.getBoundingClientRect();
      excludeRects.push({
        x: timerRect.left - areaRect.left - GAME_CONFIG.AREA_PADDING / 2,
        y: timerRect.top - areaRect.top - GAME_CONFIG.AREA_PADDING / 2,
        width: timerRect.width + GAME_CONFIG.AREA_PADDING,
        height: timerRect.height + GAME_CONFIG.AREA_PADDING,
      });
    } else {
      excludeRects.push({
        x: areaRect.width - GAME_CONFIG.SPEED100_TIMER_RESERVE_WIDTH,
        y: 0,
        width: GAME_CONFIG.SPEED100_TIMER_RESERVE_WIDTH,
        height: GAME_CONFIG.SPEED100_TIMER_RESERVE_HEIGHT,
      });
    }

    playBoundsRef.current = {
      width: areaRect.width,
      height: areaRect.height,
      topOffset: hudHeight,
      excludeRects,
    };
  }, []);

  const handleStart = useCallback(() => {
    measurePlayArea();
    setState(startSpeed100Game(playBoundsRef.current));
    setElapsedMs(0);
  }, [measurePlayArea]);

  const handleDotPointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;

      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);

      setState((prev) => {
        if (prev.phase !== "playing" || !prev.dot) return prev;
        return handleSpeed100Hit(prev, playBoundsRef.current);
      });
    },
    []
  );

  useEffect(() => {
    measurePlayArea();
    const observer = new ResizeObserver(measurePlayArea);
    if (areaRef.current) observer.observe(areaRef.current);
    if (hudRef.current) observer.observe(hudRef.current);
    return () => observer.disconnect();
  }, [measurePlayArea, state.phase]);

  useEffect(() => {
    if (state.phase !== "playing") {
      setElapsedMs(state.elapsedMs);
      return;
    }

    const tick = () => setElapsedMs(getSpeed100ElapsedMs(state));
    tick();
    const id = window.setInterval(tick, 50);
    return () => window.clearInterval(id);
  }, [state]);

  return (
    <div
      ref={areaRef}
      className="game-root relative flex-1 overflow-hidden bg-gradient-to-b from-slate-950 to-emerald-950/30"
    >
      <Speed100HUD
        ref={hudRef}
        taps={state.taps}
        targetTaps={state.targetTaps}
        elapsedMs={elapsedMs}
        phase={state.phase}
      />

      {state.phase === "playing" && state.dot && (
        <button
          type="button"
          aria-label="クリック対象"
          onPointerDown={handleDotPointerDown}
          className="game-dot absolute rounded-full bg-emerald-400 shadow-lg shadow-emerald-500/50 transition active:scale-95"
          style={{
            width: GAME_CONFIG.DOT_SIZE,
            height: GAME_CONFIG.DOT_SIZE,
            left: state.dot.x,
            top: state.dot.y,
          }}
        />
      )}

      {state.phase === "playing" && (
        <p className="pointer-events-none absolute inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] text-center text-xs text-slate-500">
          20個タップした時間を競う　｜　PC: 左クリック / スマホ: タップ
        </p>
      )}

      {state.phase === "ready" && (
        <GameOverlay variant="ready" mode="speed100" onRetry={handleStart} />
      )}

      {state.phase === "clear" && (
        <GameOverlay
          variant="clear"
          mode="speed100"
          elapsedMs={state.elapsedMs}
          onRetry={handleStart}
        />
      )}
    </div>
  );
}

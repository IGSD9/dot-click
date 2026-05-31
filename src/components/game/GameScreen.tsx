"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { saveScore } from "@/actions/score";
import { GAME_CONFIG } from "@/lib/game/constants";
import {
  advanceStage,
  createInitialState,
  getLayout,
  retryStage,
  shoot,
  tick,
} from "@/lib/game/engine";
import { renderGame } from "@/lib/game/renderer";
import type { GameResult, GameState } from "@/lib/game/types";
import { GameHUD } from "./GameHUD";
import { GameOverlay, type SaveStatus } from "./GameOverlay";

type HudSnapshot = {
  stage: number;
  arrowsRemaining: number;
  streak: number;
  phase: GameState["phase"];
};

function toHudSnapshot(state: GameState): HudSnapshot {
  return {
    stage: state.stage,
    arrowsRemaining: state.arrowsRemaining,
    streak: state.streak,
    phase: state.phase,
  };
}

function hudChanged(a: HudSnapshot, b: HudSnapshot) {
  return (
    a.stage !== b.stage ||
    a.arrowsRemaining !== b.arrowsRemaining ||
    a.streak !== b.streak ||
    a.phase !== b.phase
  );
}

export function GameScreen() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createInitialState(1));
  const layoutRef = useRef(getLayout(360, 640));
  const clearTimerRef = useRef<number | null>(null);

  const [hud, setHud] = useState<HudSnapshot>(() =>
    toHudSnapshot(stateRef.current)
  );
  const [failedStreak, setFailedStreak] = useState(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const syncHud = useCallback((state: GameState) => {
    const next = toHudSnapshot(state);
    setHud((prev) => (hudChanged(prev, next) ? next : prev));
  }, []);

  const handleGameOver = useCallback(async (result: GameResult) => {
    setSaveStatus("saving");
    const response = await saveScore({
      maxStage: result.stage,
      streak: result.streak,
    });

    if (response.success) {
      setSaveStatus("saved");
      return;
    }

    if (response.reason === "UNAUTHORIZED") {
      setSaveStatus("unauthorized");
      return;
    }

    if (response.reason === "NOT_CONFIGURED") {
      setSaveStatus("not_configured");
      return;
    }

    setSaveStatus("error");
  }, []);

  const resetClearTimer = useCallback(() => {
    if (clearTimerRef.current !== null) {
      window.clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }
  }, []);

  const applyState = useCallback(
    (state: GameState) => {
      stateRef.current = state;
      syncHud(state);
    },
    [syncHud]
  );

  const tryShoot = useCallback(() => {
    const current = stateRef.current;
    if (current.phase !== "idle") return;

    const next = shoot(current, layoutRef.current);
    if (next !== current) {
      applyState(next);
    }
  }, [applyState]);

  const handleRetry = useCallback(() => {
    resetClearTimer();
    setSaveStatus("idle");
    applyState(retryStage(stateRef.current));
  }, [applyState, resetClearTimer]);

  const handleNextStage = useCallback(() => {
    resetClearTimer();
    applyState(advanceStage(stateRef.current));
  }, [applyState, resetClearTimer]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);
      const dpr = window.devicePixelRatio || 1;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      layoutRef.current = getLayout(width, height);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    let rafId = 0;
    let prevPhase = stateRef.current.phase;

    const loop = () => {
      const layout = layoutRef.current;
      const prev = stateRef.current;
      let next = tick(prev, layout);

      if (next.phase === "gameover" && prev.phase !== "gameover") {
        setFailedStreak(prev.streak);
        handleGameOver({ stage: next.stage, streak: prev.streak });
      }

      if (next.phase === "clear" && prev.phase !== "clear") {
        resetClearTimer();
        clearTimerRef.current = window.setTimeout(() => {
          applyState(advanceStage(stateRef.current));
        }, GAME_CONFIG.CLEAR_DELAY_MS);
      }

      stateRef.current = next;
      renderGame(ctx, layout, next);

      if (
        next.stage !== prev.stage ||
        next.arrowsRemaining !== prev.arrowsRemaining ||
        next.streak !== prev.streak ||
        next.phase !== prevPhase
      ) {
        syncHud(next);
        prevPhase = next.phase;
      }

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
      resetClearTimer();
    };
  }, [applyState, handleGameOver, resetClearTimer, syncHud]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== "Space") return;
      event.preventDefault();
      tryShoot();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [tryShoot]);

  return (
    <div
      ref={containerRef}
      className="game-root relative flex-1 overflow-hidden bg-slate-950"
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full touch-none"
        onPointerDown={tryShoot}
      />

      <GameHUD
        stage={hud.stage}
        arrowsRemaining={hud.arrowsRemaining}
        streak={hud.streak}
      />

      {hud.phase === "idle" && (
        <p className="pointer-events-none absolute inset-x-0 bottom-[max(1.5rem,env(safe-area-inset-bottom))] text-center text-sm text-slate-500">
          タップ / クリック / スペースで射つ
        </p>
      )}

      {hud.phase === "gameover" && (
        <GameOverlay
          phase="gameover"
          stage={hud.stage}
          streak={failedStreak}
          saveStatus={saveStatus}
          onRetry={handleRetry}
        />
      )}

      {hud.phase === "clear" && (
        <GameOverlay
          phase="clear"
          stage={hud.stage}
          streak={hud.streak}
          onRetry={handleRetry}
          onNext={handleNextStage}
        />
      )}
    </div>
  );
}

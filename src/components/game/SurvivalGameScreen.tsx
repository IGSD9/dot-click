"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getPlayerIdentity, saveGameScore } from "@/actions/score";
import type { PlayerIdentity } from "@/actions/score";
import { GAME_CONFIG } from "@/lib/game/constants";
import {
  createSurvivalInitialState,
  handleSurvivalHit,
  handleSurvivalMiss,
  spawnSurvivalDot,
  startSurvivalGame,
} from "@/lib/game/engine-survival";
import type { PlayAreaBounds } from "@/lib/game/spawn";
import type { SurvivalState } from "@/lib/game/types";
import { writeStoredPlayerName } from "@/lib/player";
import { CountdownOverlay } from "./CountdownOverlay";
import { GameHUD } from "./GameHUD";
import { GameOverlay, type SaveStatus } from "./GameOverlay";
import { ReadyOverlay } from "./ReadyOverlay";

export function SurvivalGameScreen() {
  const areaRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLElement>(null);
  const timerRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const deadlineRef = useRef<number>(0);
  const playBoundsRef = useRef<PlayAreaBounds>({
    width: 360,
    height: 640,
    topOffset: GAME_CONFIG.HUD_FALLBACK_HEIGHT,
  });
  const pendingScoreRef = useRef(0);

  const [state, setState] = useState<SurvivalState>(createSurvivalInitialState);
  const [timeLeftMs, setTimeLeftMs] = useState<number>(
    GAME_CONFIG.INITIAL_TIME_MS
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveUpdated, setSaveUpdated] = useState<boolean | undefined>();
  const [saveMessage, setSaveMessage] = useState<string | undefined>();
  const [countdown, setCountdown] = useState<number | null>(null);
  const [identity, setIdentity] = useState<PlayerIdentity | null>(null);

  const isAuthenticated = identity?.type === "authenticated";

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const clearCountdownTimer = useCallback(() => {
    if (countdownTimerRef.current !== null) {
      window.clearTimeout(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, []);

  const measurePlayArea = useCallback(() => {
    const areaRect = areaRef.current?.getBoundingClientRect();
    if (!areaRect) return;

    const hudHeight =
      hudRef.current?.getBoundingClientRect().height ??
      GAME_CONFIG.HUD_FALLBACK_HEIGHT;

    playBoundsRef.current = {
      width: areaRect.width,
      height: areaRect.height,
      topOffset: hudHeight,
    };
  }, []);

  const saveScore = useCallback(
    async (clicks: number, guestName?: string) => {
      setSaveStatus("saving");
      setSaveMessage(undefined);
      const response = await saveGameScore({
        mode: "survival",
        clicks,
        guestName,
      });

      if (response.success) {
        setSaveUpdated(response.updated);
        setSaveStatus("saved");
        return;
      }
      if (response.reason === "INVALID_NAME") {
        setSaveMessage(response.message);
        setSaveStatus("invalid_name");
        return;
      }
      if (response.reason === "NOT_CONFIGURED") {
        setSaveMessage(response.message);
        setSaveStatus("not_configured");
        return;
      }
      setSaveMessage(response.message);
      setSaveStatus("error");
    },
    []
  );

  const onGameOver = useCallback(
    (clicks: number) => {
      pendingScoreRef.current = clicks;
      if (isAuthenticated) {
        void saveScore(clicks);
      }
    },
    [isAuthenticated, saveScore]
  );

  const handleGuestRegister = useCallback(
    (name: string) => {
      writeStoredPlayerName(name);
      void saveScore(pendingScoreRef.current, name);
    },
    [saveScore]
  );

  const handleGuestSkip = useCallback(() => {
    setSaveStatus("skipped");
  }, []);

  const handleTimeout = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== "playing") return prev;

      const afterMiss = handleSurvivalMiss(prev);
      if (afterMiss.phase === "gameover") {
        onGameOver(afterMiss.score);
        return afterMiss;
      }

      return spawnSurvivalDot(afterMiss, playBoundsRef.current);
    });
  }, [onGameOver]);

  const scheduleRound = useCallback(
    (limitMs: number) => {
      clearTimer();
      deadlineRef.current = performance.now() + limitMs;
      setTimeLeftMs(limitMs);
      timerRef.current = window.setTimeout(handleTimeout, limitMs);
    },
    [clearTimer, handleTimeout]
  );

  const beginSurvivalGame = useCallback(() => {
    measurePlayArea();
    clearTimer();
    setState(startSurvivalGame(playBoundsRef.current));
    setSaveStatus("idle");
    setSaveUpdated(undefined);
    setSaveMessage(undefined);
  }, [clearTimer, measurePlayArea]);

  const handleStart = useCallback(() => {
    clearCountdownTimer();
    setCountdown(3);
  }, [clearCountdownTimer]);

  const handleDotPointerDown = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;

      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
      clearTimer();

      setState((prev) => {
        if (prev.phase !== "playing" || !prev.dot) return prev;

        const afterHit = handleSurvivalHit(prev);
        return spawnSurvivalDot(afterHit, playBoundsRef.current);
      });
    },
    [clearTimer]
  );

  useEffect(() => {
    void getPlayerIdentity().then(setIdentity);
  }, []);

  useEffect(() => {
    measurePlayArea();
    const observer = new ResizeObserver(measurePlayArea);
    if (areaRef.current) observer.observe(areaRef.current);
    if (hudRef.current) observer.observe(hudRef.current);
    return () => observer.disconnect();
  }, [measurePlayArea, state.phase]);

  useEffect(() => {
    if (state.phase === "playing" && state.dot) {
      scheduleRound(state.timeLimitMs);
    } else {
      clearTimer();
    }
  }, [
    state.phase,
    state.score,
    state.misses,
    state.dot?.x,
    state.dot?.y,
    state.timeLimitMs,
    scheduleRound,
    clearTimer,
  ]);

  useEffect(() => {
    if (state.phase !== "playing") return;

    const tick = () => {
      setTimeLeftMs(Math.max(0, deadlineRef.current - performance.now()));
    };

    tick();
    const id = window.setInterval(tick, 50);
    return () => window.clearInterval(id);
  }, [state.phase, state.score, state.misses, state.timeLimitMs]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      setCountdown(null);
      beginSurvivalGame();
      return;
    }

    clearCountdownTimer();
    countdownTimerRef.current = window.setTimeout(() => {
      setCountdown((prev) => (prev === null ? null : prev - 1));
    }, 1000);

    return clearCountdownTimer;
  }, [beginSurvivalGame, clearCountdownTimer, countdown]);

  useEffect(
    () => () => {
      clearCountdownTimer();
      clearTimer();
    },
    [clearCountdownTimer, clearTimer]
  );

  return (
    <div
      ref={areaRef}
      className="game-root relative flex-1 overflow-hidden bg-gradient-to-b from-slate-950 to-indigo-950"
    >
      <GameHUD
        ref={hudRef}
        score={state.score}
        misses={state.misses}
        maxMisses={GAME_CONFIG.MAX_MISSES}
        timeLimitMs={state.timeLimitMs}
        timeLeftMs={timeLeftMs}
        phase={state.phase}
      />

      {state.phase === "playing" && state.dot && (
        <button
          type="button"
          aria-label="クリック対象"
          onPointerDown={handleDotPointerDown}
          className="game-dot absolute rounded-full bg-indigo-400 shadow-lg shadow-indigo-500/50 transition active:scale-95"
          style={{
            width: GAME_CONFIG.DOT_SIZE,
            height: GAME_CONFIG.DOT_SIZE,
            left: state.dot.x,
            top: state.dot.y,
          }}
        />
      )}

      {countdown !== null && <CountdownOverlay count={countdown} />}

      {state.phase === "ready" && countdown === null && (
        <ReadyOverlay mode="survival" identity={identity} onStart={handleStart} />
      )}

      {state.phase === "gameover" && countdown === null && (
        <GameOverlay
          variant="gameover"
          mode="survival"
          score={state.score}
          saveStatus={saveStatus}
          saveUpdated={saveUpdated}
          saveMessage={saveMessage}
          isAuthenticated={isAuthenticated}
          onGuestRegister={isAuthenticated ? undefined : handleGuestRegister}
          onGuestSkip={isAuthenticated ? undefined : handleGuestSkip}
          onRetry={handleStart}
        />
      )}
    </div>
  );
}

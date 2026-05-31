"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getPlayerIdentity, saveGameScore } from "@/actions/score";
import type { PlayerIdentity } from "@/actions/score";
import { GAME_CONFIG } from "@/lib/game/constants";
import {
  createSpeed100InitialState,
  getSpeed100ElapsedMs,
  handleSpeed100Hit,
  startSpeed100Game,
} from "@/lib/game/engine-speed100";
import type { PlayAreaBounds } from "@/lib/game/spawn";
import type { Speed100State } from "@/lib/game/types";
import { writeStoredPlayerName } from "@/lib/player";
import { CountdownOverlay } from "./CountdownOverlay";
import { GameOverlay } from "./GameOverlay";
import type { SaveStatus } from "./GameOverlay";
import { ReadyOverlay } from "./ReadyOverlay";
import { Speed100HUD } from "./Speed100HUD";

export function Speed100GameScreen() {
  const areaRef = useRef<HTMLDivElement>(null);
  const hudRef = useRef<HTMLElement>(null);
  const countdownTimerRef = useRef<number | null>(null);
  const playBoundsRef = useRef<PlayAreaBounds>({
    width: 360,
    height: 640,
    topOffset: GAME_CONFIG.HUD_FALLBACK_HEIGHT,
    excludeRects: [],
  });
  const pendingElapsedMsRef = useRef(0);

  const [state, setState] = useState<Speed100State>(createSpeed100InitialState);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveUpdated, setSaveUpdated] = useState<boolean | undefined>();
  const [saveMessage, setSaveMessage] = useState<string | undefined>();
  const [identity, setIdentity] = useState<PlayerIdentity | null>(null);

  const isAuthenticated = identity?.type === "authenticated";

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

  const saveScore = useCallback(async (elapsed: number, guestName?: string) => {
    setSaveStatus("saving");
    setSaveMessage(undefined);
    const response = await saveGameScore({
      mode: "speed100",
      elapsedMs: elapsed,
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
  }, []);

  const handleGuestRegister = useCallback(
    (name: string) => {
      writeStoredPlayerName(name);
      void saveScore(pendingElapsedMsRef.current, name);
    },
    [saveScore]
  );

  const handleGuestSkip = useCallback(() => {
    setSaveStatus("skipped");
  }, []);

  const beginSpeed100Game = useCallback(() => {
    measurePlayArea();
    setState(startSpeed100Game(playBoundsRef.current));
    setElapsedMs(0);
    setSaveStatus("idle");
    setSaveUpdated(undefined);
    setSaveMessage(undefined);
  }, [measurePlayArea]);

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

      setState((prev) => {
        if (prev.phase !== "playing" || !prev.dot) return prev;
        return handleSpeed100Hit(prev, playBoundsRef.current);
      });
    },
    []
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
    if (state.phase !== "playing") {
      setElapsedMs(state.elapsedMs);
      return;
    }

    const tick = () => setElapsedMs(getSpeed100ElapsedMs(state));
    tick();
    const id = window.setInterval(tick, 50);
    return () => window.clearInterval(id);
  }, [state]);

  useEffect(() => {
    if (state.phase !== "clear") return;

    pendingElapsedMsRef.current = state.elapsedMs;
    if (isAuthenticated) {
      void saveScore(state.elapsedMs);
    }
  }, [isAuthenticated, saveScore, state.elapsedMs, state.phase]);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      setCountdown(null);
      beginSpeed100Game();
      return;
    }

    clearCountdownTimer();
    countdownTimerRef.current = window.setTimeout(() => {
      setCountdown((prev) => (prev === null ? null : prev - 1));
    }, 1000);

    return clearCountdownTimer;
  }, [beginSpeed100Game, clearCountdownTimer, countdown]);

  useEffect(() => () => clearCountdownTimer(), [clearCountdownTimer]);

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

      {countdown !== null && <CountdownOverlay count={countdown} />}

      {state.phase === "ready" && countdown === null && (
        <ReadyOverlay mode="speed100" identity={identity} onStart={handleStart} />
      )}

      {state.phase === "clear" && countdown === null && (
        <GameOverlay
          variant="clear"
          mode="speed100"
          elapsedMs={state.elapsedMs}
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

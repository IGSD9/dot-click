"use client";

import Link from "next/link";
import { useState } from "react";
import type { GameMode } from "@/lib/game/modes";
import { formatElapsedSeconds } from "@/lib/game/types";
import { PLAYER_NAME_MAX, readStoredPlayerName, validatePlayerName } from "@/lib/player";

export type SaveStatus =
  | "idle"
  | "saving"
  | "saved"
  | "not_configured"
  | "error"
  | "invalid_name"
  | "skipped";

type GameOverlayProps = {
  mode: GameMode;
  score?: number;
  elapsedMs?: number;
  saveStatus?: SaveStatus;
  saveUpdated?: boolean;
  isAuthenticated?: boolean;
  onRetry: () => void;
  onGuestRegister?: (name: string) => void;
  onGuestSkip?: () => void;
  variant?: "gameover" | "clear";
};

function SaveMessage({
  status,
  updated,
}: {
  status: Exclude<SaveStatus, "idle" | "saving">;
  updated?: boolean;
}) {
  if (status === "saved") {
    const message = updated
      ? "ランキングに登録しました（自己ベスト更新！）"
      : "ランキングに登録しました";
    return <p className="mt-3 text-sm text-emerald-400">{message}</p>;
  }

  if (status === "skipped") {
    return (
      <p className="mt-3 text-sm text-slate-500">ランキングには登録しませんでした</p>
    );
  }

  const messages: Record<
    Exclude<SaveStatus, "idle" | "saving" | "saved" | "skipped">,
    string
  > = {
    not_configured: "DB 未設定のためスコアは保存されません",
    error: "ランキングへの登録に失敗しました",
    invalid_name: "プレイヤー名が無効です。もう一度お試しください",
  };

  return <p className="mt-3 text-sm text-rose-400">{messages[status]}</p>;
}

export function GameOverlay({
  score = 0,
  elapsedMs = 0,
  saveStatus = "idle",
  saveUpdated,
  isAuthenticated = false,
  onRetry,
  onGuestRegister,
  onGuestSkip,
  variant = "gameover",
}: GameOverlayProps) {
  const isClear = variant === "clear";
  const [guestStep, setGuestStep] = useState<"prompt" | "name">("prompt");
  const [guestName, setGuestName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  const title = isClear ? "Clear!" : "Game Over";
  const headline = isClear
    ? `${formatElapsedSeconds(elapsedMs)} 秒`
    : `${score} CLICKS`;
  const subtitle = isClear ? "20タップ達成" : "クリック成功数";

  const showGuestPrompt =
    !isAuthenticated &&
    saveStatus === "idle" &&
    guestStep === "prompt" &&
    onGuestRegister;

  const showGuestNameForm =
    !isAuthenticated &&
    (saveStatus === "idle" || saveStatus === "invalid_name") &&
    guestStep === "name" &&
    onGuestRegister;

  const handleOpenNameForm = () => {
    setGuestName(readStoredPlayerName());
    setNameError(null);
    setGuestStep("name");
  };

  const handleSubmitName = () => {
    const error = validatePlayerName(guestName);
    if (error) {
      setNameError(error);
      return;
    }
    onGuestRegister?.(guestName.trim());
  };

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/75 px-6 backdrop-blur-md">
      <div className="overlay-panel w-full max-w-sm rounded-3xl border border-slate-700/80 bg-slate-900/95 p-8 text-center shadow-2xl shadow-indigo-950/50">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
          {title}
        </p>
        <h2 className="mt-3 text-4xl font-bold text-white">{headline}</h2>
        <p className="mt-2 text-slate-400">{subtitle}</p>

        {saveStatus === "saving" && (
          <p className="mt-3 text-sm text-slate-400">ランキングに登録中...</p>
        )}
        {saveStatus !== "saving" &&
          saveStatus !== "idle" &&
          saveStatus !== "invalid_name" && (
            <SaveMessage status={saveStatus} updated={saveUpdated} />
          )}
        {saveStatus === "invalid_name" && !showGuestNameForm && (
          <SaveMessage status={saveStatus} updated={saveUpdated} />
        )}

        {showGuestPrompt && (
          <div className="mt-6">
            <p className="text-sm text-slate-300">ランキングに登録しますか？</p>
            <div className="mt-4 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleOpenNameForm}
                className="rounded-full bg-indigo-500 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-400 active:scale-[0.98]"
              >
                登録する
              </button>
              <button
                type="button"
                onClick={onGuestSkip}
                className="rounded-full border border-slate-600 py-3 font-semibold text-slate-300 transition hover:bg-slate-800"
              >
                スキップ
              </button>
            </div>
          </div>
        )}

        {showGuestNameForm && (
          <div className="mt-6 text-left">
            <label className="block text-sm text-slate-300">
              プレイヤー名
              <input
                type="text"
                value={guestName}
                maxLength={PLAYER_NAME_MAX}
                onChange={(event) => {
                  setGuestName(event.target.value);
                  if (nameError) setNameError(null);
                }}
                placeholder="例: たろう"
                className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
              />
            </label>
            {nameError && (
              <p className="mt-2 text-sm text-rose-400">{nameError}</p>
            )}
            {saveStatus === "invalid_name" && (
              <p className="mt-2 text-sm text-rose-400">
                プレイヤー名が無効です。もう一度お試しください
              </p>
            )}
            <div className="mt-4 flex flex-col gap-3">
              <button
                type="button"
                onClick={handleSubmitName}
                className="rounded-full bg-indigo-500 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-400 active:scale-[0.98]"
              >
                この名前で登録
              </button>
              <button
                type="button"
                onClick={onGuestSkip}
                className="rounded-full border border-slate-600 py-3 font-semibold text-slate-300 transition hover:bg-slate-800"
              >
                やっぱりスキップ
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="rounded-full bg-indigo-500 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-400 active:scale-[0.98]"
          >
            RETRY
          </button>

          {!isAuthenticated && (
            <Link
              href="/auth/login"
              className="rounded-full border border-indigo-500/60 py-3 text-sm font-semibold text-indigo-300 transition hover:bg-indigo-500/10"
            >
              ログインして記録を引き継ぐ
            </Link>
          )}

          <Link
            href="/"
            className="rounded-full border border-slate-600 py-3 font-semibold text-slate-200 transition hover:bg-slate-800"
          >
            HOME
          </Link>
        </div>
      </div>
    </div>
  );
}

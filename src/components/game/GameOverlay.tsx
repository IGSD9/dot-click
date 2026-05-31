import Link from "next/link";
import type { GameMode } from "@/lib/game/modes";
import { formatElapsedSeconds } from "@/lib/game/types";

export type SaveStatus =
  | "idle"
  | "saving"
  | "saved"
  | "not_configured"
  | "error"
  | "invalid_name";

type GameOverlayProps = {
  mode: GameMode;
  score?: number;
  elapsedMs?: number;
  saveStatus?: SaveStatus;
  saveUpdated?: boolean;
  isAuthenticated?: boolean;
  onRetry: () => void;
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
      ? "ランキングに保存しました（自己ベスト更新！）"
      : "プレイ記録を保存しました（自己ベスト未更新）";
    return <p className="mt-3 text-sm text-slate-400">{message}</p>;
  }

  const messages: Record<
    Exclude<SaveStatus, "idle" | "saving" | "saved">,
    string
  > = {
    not_configured: "DB 未設定のためスコアは保存されません",
    error: "スコアの保存に失敗しました",
    invalid_name: "プレイヤー名が無効です。もう一度お試しください",
  };

  return <p className="mt-3 text-sm text-slate-400">{messages[status]}</p>;
}

export function GameOverlay({
  mode,
  score = 0,
  elapsedMs = 0,
  saveStatus = "idle",
  saveUpdated,
  isAuthenticated = false,
  onRetry,
  variant = "gameover",
}: GameOverlayProps) {
  const isClear = variant === "clear";

  const title = isClear ? "Clear!" : "Game Over";

  const headline = isClear
    ? `${formatElapsedSeconds(elapsedMs)} 秒`
    : `${score} CLICKS`;

  const subtitle = isClear ? "20タップ達成" : "クリック成功数";

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/75 px-6 backdrop-blur-md">
      <div className="overlay-panel w-full max-w-sm rounded-3xl border border-slate-700/80 bg-slate-900/95 p-8 text-center shadow-2xl shadow-indigo-950/50">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
          {title}
        </p>
        <h2 className="mt-3 text-4xl font-bold text-white">{headline}</h2>
        <p className="mt-2 text-slate-400">{subtitle}</p>

        {saveStatus === "saving" && (
          <p className="mt-3 text-sm text-slate-400">スコアを保存中...</p>
        )}
        {saveStatus !== "saving" &&
          saveStatus !== "idle" && (
            <SaveMessage status={saveStatus} updated={saveUpdated} />
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

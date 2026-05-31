import Link from "next/link";
import type { GameMode } from "@/lib/game/modes";
import { formatElapsedSeconds } from "@/lib/game/types";

export type SaveStatus =
  | "idle"
  | "saving"
  | "saved"
  | "unauthorized"
  | "not_configured"
  | "error";

type GameOverlayProps = {
  mode: GameMode;
  score?: number;
  elapsedMs?: number;
  saveStatus?: SaveStatus;
  onRetry: () => void;
  variant?: "gameover" | "ready" | "clear";
};

function SaveMessage({
  status,
}: {
  status: Exclude<SaveStatus, "idle" | "saving">;
}) {
  const messages: Record<Exclude<SaveStatus, "idle" | "saving">, string> = {
    saved: "スコアを保存しました",
    unauthorized: "ログインするとスコアを保存できます",
    not_configured: "DB 未設定のためスコアは保存されません",
    error: "スコアの保存に失敗しました",
  };

  return <p className="mt-3 text-sm text-slate-400">{messages[status]}</p>;
}

export function GameOverlay({
  mode,
  score = 0,
  elapsedMs = 0,
  saveStatus = "idle",
  onRetry,
  variant = "gameover",
}: GameOverlayProps) {
  const isReady = variant === "ready";
  const isClear = variant === "clear";
  const isSpeed100 = mode === "speed100";

  const title = isReady
    ? isSpeed100
      ? "20点スピード"
      : "サバイバル"
    : isClear
      ? "Clear!"
      : "Game Over";

  const headline = isReady
    ? "READY?"
    : isClear
      ? `${formatElapsedSeconds(elapsedMs)} 秒`
      : `${score} CLICKS`;

  const subtitle = isReady
    ? isSpeed100
      ? "20個タップした時間を計測"
      : "制限時間内にクリック"
    : isClear
      ? "20タップ達成"
      : "クリック成功数";

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/75 px-6 backdrop-blur-md">
      <div className="overlay-panel w-full max-w-sm rounded-3xl border border-slate-700/80 bg-slate-900/95 p-8 text-center shadow-2xl shadow-indigo-950/50">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
          {title}
        </p>
        <h2 className="mt-3 text-4xl font-bold text-white">{headline}</h2>
        {!isReady && <p className="mt-2 text-slate-400">{subtitle}</p>}

        {!isReady &&
          !isClear &&
          saveStatus === "saving" && (
            <p className="mt-3 text-sm text-slate-400">スコアを保存中...</p>
          )}
        {!isReady &&
          !isClear &&
          saveStatus !== "saving" &&
          saveStatus !== "idle" && <SaveMessage status={saveStatus} />}

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={onRetry}
            className="rounded-full bg-indigo-500 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-400 active:scale-[0.98]"
          >
            {isReady ? "START" : "RETRY"}
          </button>

          {!isReady && !isClear && saveStatus === "unauthorized" && (
            <Link
              href="/auth/login"
              className="rounded-full border border-indigo-500 py-3 font-semibold text-indigo-300 transition hover:bg-indigo-500/10"
            >
              LOGIN TO SAVE
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

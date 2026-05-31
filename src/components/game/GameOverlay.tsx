import Link from "next/link";

export type SaveStatus =
  | "idle"
  | "saving"
  | "saved"
  | "unauthorized"
  | "not_configured"
  | "error";

type GameOverlayProps = {
  phase: "clear" | "gameover";
  stage: number;
  streak: number;
  saveStatus?: SaveStatus;
  onRetry: () => void;
  onNext?: () => void;
};

function SaveMessage({ status }: { status: SaveStatus }) {
  if (status === "idle" || status === "saving") return null;

  const messages: Record<Exclude<SaveStatus, "idle" | "saving">, string> = {
    saved: "スコアを保存しました",
    unauthorized: "ログインするとスコアを保存できます",
    not_configured: "DB 未設定のためスコアは保存されません",
    error: "スコアの保存に失敗しました",
  };

  return (
    <p className="mt-3 text-sm text-slate-400">{messages[status]}</p>
  );
}

export function GameOverlay({
  phase,
  stage,
  streak,
  saveStatus = "idle",
  onRetry,
  onNext,
}: GameOverlayProps) {
  const isClear = phase === "clear";

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/70 px-6 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl border border-slate-700 bg-slate-900 p-8 text-center shadow-2xl">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
          {isClear ? "Stage Clear" : "Game Over"}
        </p>
        <h2 className="mt-3 text-4xl font-bold text-white">
          {isClear ? "NICE!" : "OOPS"}
        </h2>
        <p className="mt-4 text-slate-300">
          Stage <span className="font-semibold text-white">{stage}</span>
          {!isClear && streak > 0 && (
            <>
              {" "}
              · Streak{" "}
              <span className="font-semibold text-amber-400">{streak}</span>
            </>
          )}
        </p>

        {!isClear && saveStatus === "saving" && (
          <p className="mt-3 text-sm text-slate-400">スコアを保存中...</p>
        )}
        {!isClear && saveStatus !== "saving" && (
          <SaveMessage status={saveStatus} />
        )}

        <div className="mt-8 flex flex-col gap-3">
          {isClear ? (
            <button
              type="button"
              onClick={onNext}
              className="rounded-full bg-indigo-500 py-3 font-semibold text-white transition hover:bg-indigo-400"
            >
              NEXT STAGE
            </button>
          ) : (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-full bg-indigo-500 py-3 font-semibold text-white transition hover:bg-indigo-400"
            >
              RETRY
            </button>
          )}

          {!isClear && saveStatus === "unauthorized" && (
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

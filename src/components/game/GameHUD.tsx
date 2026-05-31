import { forwardRef } from "react";

type GameHUDProps = {
  score: number;
  misses: number;
  maxMisses: number;
  timeLimitMs: number;
  timeLeftMs: number;
  phase: "ready" | "playing" | "gameover";
};

export const GameHUD = forwardRef<HTMLElement, GameHUDProps>(function GameHUD(
  { score, misses, maxMisses, timeLimitMs, timeLeftMs, phase },
  ref
) {
  const progress =
    phase === "playing" && timeLimitMs > 0
      ? Math.max(0, Math.min(100, (timeLeftMs / timeLimitMs) * 100))
      : 100;

  return (
    <header
      ref={ref}
      className="pointer-events-none absolute inset-x-0 top-0 z-10 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-2"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">
            Score
          </p>
          <p className="text-3xl font-bold tabular-nums text-white">{score}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-widest text-slate-400">
            Miss
          </p>
          <p className="text-3xl font-bold tabular-nums text-rose-400">
            {misses} / {maxMisses}
          </p>
        </div>
      </div>

      {phase === "playing" && (
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-400 transition-[width] duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </header>
  );
});

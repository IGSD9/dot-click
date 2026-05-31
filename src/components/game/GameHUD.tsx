type GameHUDProps = {
  stage: number;
  arrowsRemaining: number;
  streak: number;
};

export function GameHUD({ stage, arrowsRemaining, streak }: GameHUDProps) {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="flex min-w-[72px] flex-col items-start gap-1">
        <span className="text-xs uppercase tracking-widest text-slate-400">
          Arrows
        </span>
        <span className="text-2xl font-bold tabular-nums text-white">
          {arrowsRemaining}
        </span>
      </div>

      <div className="flex flex-col items-center">
        <span className="text-xs uppercase tracking-widest text-slate-400">
          Stage
        </span>
        <span className="text-3xl font-bold tabular-nums text-white">
          {stage}
        </span>
      </div>

      <div className="flex min-w-[72px] flex-col items-end gap-1">
        <span className="text-xs uppercase tracking-widest text-slate-400">
          Streak
        </span>
        <span className="text-2xl font-bold tabular-nums text-amber-400">
          {streak > 0 ? `🔥 ${streak}` : "—"}
        </span>
      </div>
    </header>
  );
}

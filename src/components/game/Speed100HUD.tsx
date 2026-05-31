import { forwardRef } from "react";
import { formatElapsedSeconds } from "@/lib/game/types";

type Speed100HUDProps = {
  taps: number;
  targetTaps: number;
  elapsedMs: number;
  phase: "ready" | "playing" | "clear";
};

export const Speed100HUD = forwardRef<HTMLElement, Speed100HUDProps>(
  function Speed100HUD({ taps, targetTaps, elapsedMs, phase }, ref) {
    return (
      <header
        ref={ref}
        className="pointer-events-none absolute inset-x-0 top-0 z-10 px-4 pb-3 pt-[max(0.5rem,env(safe-area-inset-top))] sm:pt-[max(1rem,env(safe-area-inset-top))]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-widest text-slate-400 sm:text-xs">
              Taps
            </p>
            <p className="text-4xl font-bold tabular-nums text-white sm:text-3xl">
              {taps}
              <span className="text-xl text-slate-500 sm:text-lg"> / {targetTaps}</span>
            </p>
          </div>

          <div
            data-timer-zone
            className="min-w-[7.5rem] rounded-2xl border border-slate-700/80 bg-slate-900/80 px-4 py-2.5 text-right sm:min-w-[7rem] sm:py-2"
          >
            <p className="text-sm font-medium uppercase tracking-widest text-slate-400 sm:text-xs">
              Time
            </p>
            <p className="text-4xl font-bold tabular-nums text-emerald-400 sm:text-3xl">
              {phase === "ready" ? "0.00" : formatElapsedSeconds(elapsedMs)}
              <span className="ml-0.5 text-base font-semibold text-slate-400">
                秒
              </span>
            </p>
          </div>
        </div>
      </header>
    );
  }
);

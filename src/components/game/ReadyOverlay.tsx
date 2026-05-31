"use client";

import Link from "next/link";
import type { GameMode } from "@/lib/game/modes";
import type { PlayerIdentity } from "@/actions/score";

type ReadyOverlayProps = {
  mode: GameMode;
  identity: PlayerIdentity | null;
  onStart: () => void;
};

export function ReadyOverlay({ mode, identity, onStart }: ReadyOverlayProps) {
  const isSpeed100 = mode === "speed100";
  const isAuthenticated = identity?.type === "authenticated";

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/75 px-6 backdrop-blur-md">
      <div className="overlay-panel w-full max-w-sm rounded-3xl border border-slate-700/80 bg-slate-900/95 p-8 text-center shadow-2xl shadow-indigo-950/50">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">
          {isSpeed100 ? "20点スピード" : "サバイバル"}
        </p>
        <h2 className="mt-3 text-4xl font-bold text-white">READY?</h2>
        <p className="mt-2 text-sm text-slate-400">
          {isSpeed100
            ? "20個タップした時間を計測"
            : "制限時間内にクリック"}
        </p>

        {isAuthenticated && (
          <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-left">
            <p className="text-xs text-slate-500">ログイン中</p>
            <p className="mt-1 font-semibold text-white">{identity.name}</p>
            <p className="mt-1 truncate text-xs text-slate-400">
              {identity.email}
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={onStart}
            className="rounded-full bg-indigo-500 py-3 font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-400 active:scale-[0.98]"
          >
            START
          </button>

          {!isAuthenticated && (
            <Link
              href="/auth/login"
              className="rounded-full border border-indigo-500 py-3 font-semibold text-indigo-300 transition hover:bg-indigo-500/10"
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

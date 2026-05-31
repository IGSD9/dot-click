import Link from "next/link";
import { Clock, Target, Trophy, Zap } from "lucide-react";
import { GAME_MODES } from "@/lib/game/modes";
import { SiteHeader } from "@/components/ui/SiteHeader";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="relative flex flex-1 flex-col items-center gap-10 overflow-hidden px-6 py-10">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          aria-hidden
        >
          <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/20 blur-3xl" />
        </div>

        <div className="relative text-center">
          <div
            className="hero-dot mx-auto mb-6 h-16 w-16 rounded-full bg-indigo-400"
            aria-hidden
          />
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Dot Click
          </h1>
          <p className="mt-3 text-slate-400">モードを選んでプレイ</p>
        </div>

        <div className="relative grid w-full max-w-lg gap-4">
          <Link
            href={GAME_MODES.survival.href}
            className="group rounded-3xl border border-slate-800 bg-slate-900/70 p-6 transition hover:border-indigo-500/60 hover:bg-slate-900"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-indigo-500/15 p-3">
                <Zap className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {GAME_MODES.survival.name}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {GAME_MODES.survival.description}
                </p>
                <p className="mt-3 text-xs text-indigo-400 group-hover:underline">
                  プレイする →
                </p>
              </div>
            </div>
          </Link>

          <Link
            href={GAME_MODES.speed100.href}
            className="group rounded-3xl border border-slate-800 bg-slate-900/70 p-6 transition hover:border-emerald-500/60 hover:bg-slate-900"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-emerald-500/15 p-3">
                <Clock className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {GAME_MODES.speed100.name}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {GAME_MODES.speed100.description}
                </p>
                <p className="mt-3 text-xs text-emerald-400 group-hover:underline">
                  プレイする →
                </p>
              </div>
            </div>
          </Link>
        </div>

        <div className="relative flex w-full max-w-sm items-start justify-center gap-4 px-2 text-center text-xs text-slate-500">
          <div className="flex flex-1 flex-col items-center gap-1.5">
            <Target className="h-4 w-4 text-indigo-400/60" aria-hidden />
            <span>点をクリック</span>
          </div>
          <div className="flex flex-1 flex-col items-center gap-1.5">
            <Clock className="h-4 w-4 text-emerald-400/60" aria-hidden />
            <span>2つのモード</span>
          </div>
          <Link
            href="/leaderboard"
            className="flex flex-1 flex-col items-center gap-1.5 px-2 py-1 text-slate-400 transition hover:text-amber-300 active:text-amber-300"
          >
            <Trophy className="h-4 w-4 text-amber-400" aria-hidden />
            <span className="underline decoration-amber-400/40 underline-offset-4">
              ランキング
            </span>
          </Link>
        </div>

        <p className="relative max-w-sm text-center text-xs text-slate-600">
          PC: マウス左クリック　｜　スマホ: 指でタップ
        </p>
      </main>
    </>
  );
}

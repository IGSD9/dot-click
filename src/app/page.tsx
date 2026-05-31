import Link from "next/link";
import { Clock, Trophy, Zap } from "lucide-react";
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
          <p className="mt-3 text-slate-400">
            名前を決めてすぐプレイ。ログインすると記録を引き継げます
          </p>
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

          <Link
            href="/leaderboard"
            className="group rounded-3xl border border-slate-800 bg-slate-900/70 p-6 transition hover:border-amber-500/60 hover:bg-slate-900"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-amber-500/15 p-3">
                <Trophy className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">ランキング</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  サバイバルモードの最多クリック数 TOP 50
                </p>
                <p className="mt-3 text-xs text-amber-400 group-hover:underline">
                  見る →
                </p>
              </div>
            </div>
          </Link>
        </div>

        <p className="relative max-w-sm text-center text-xs text-slate-600">
          PC: マウス左クリック　｜　スマホ: 指でタップ
        </p>
      </main>
    </>
  );
}

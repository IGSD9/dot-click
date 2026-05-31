import Link from "next/link";
import { SiteHeader } from "@/components/ui/SiteHeader";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            HitArrow
          </h1>
          <p className="mt-3 text-slate-400">
            回転する的に矢を刺すタイミングゲーム
          </p>
        </div>

        <Link
          href="/game"
          className="rounded-full bg-indigo-500 px-10 py-4 text-lg font-semibold text-white transition hover:bg-indigo-400"
        >
          PLAY
        </Link>

        <Link
          href="/leaderboard"
          className="text-sm text-indigo-400 hover:underline"
        >
          ランキングを見る
        </Link>

        <p className="max-w-sm text-center text-sm text-slate-500">
          PC: クリック / スペース　｜　スマホ: タップで操作
        </p>
      </main>
    </>
  );
}

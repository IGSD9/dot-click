import Link from "next/link";
import { getLeaderboard } from "@/actions/score";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { getDatabaseConfigErrorMessage } from "@/lib/database";
import { parseGameMode } from "@/lib/game/modes";

export const dynamic = "force-dynamic";

type LeaderboardPageProps = {
  searchParams: Promise<{ mode?: string }>;
};

export default async function LeaderboardPage({
  searchParams,
}: LeaderboardPageProps) {
  const { mode: modeParam } = await searchParams;
  const mode = parseGameMode(modeParam);
  const { entries, dbError } = await getLeaderboard(mode);
  const emptyMessage = dbError
    ? dbError
    : getDatabaseConfigErrorMessage() ??
      (mode === "survival"
        ? "まだサバイバルのスコアがありません。ゲームをプレイして記録を残しましょう。"
        : "まだ20点スピードの記録がありません。ゲームをプレイして記録を残しましょう。");

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
        <p className="mt-2 text-slate-400">
          {mode === "survival" ? "サバイバル TOP 50" : "20点スピード TOP 50"}
        </p>
        <div className="mt-6 inline-flex rounded-full border border-slate-700 bg-slate-900/60 p-1 text-sm">
          <Link
            href="/leaderboard?mode=survival"
            className={`rounded-full px-4 py-2 transition ${
              mode === "survival"
                ? "bg-indigo-500 text-white"
                : "text-slate-300 hover:text-white"
            }`}
          >
            サバイバル
          </Link>
          <Link
            href="/leaderboard?mode=speed100"
            className={`rounded-full px-4 py-2 transition ${
              mode === "speed100"
                ? "bg-emerald-500 text-white"
                : "text-slate-300 hover:text-white"
            }`}
          >
            20点スピード
          </Link>
        </div>
        <div className="mt-8">
          <LeaderboardTable
            entries={entries}
            mode={mode}
            emptyMessage={emptyMessage}
          />
        </div>
        <Link href={`/game?mode=${mode}`} className="btn-secondary mt-8 inline-block">
          ゲームをプレイする
        </Link>
      </main>
    </div>
  );
}

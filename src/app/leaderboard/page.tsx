import Link from "next/link";
import { getLeaderboard } from "@/actions/score";
import { LeaderboardTable } from "@/components/leaderboard/LeaderboardTable";
import { SiteHeader } from "@/components/ui/SiteHeader";

export default async function LeaderboardPage() {
  const entries = await getLeaderboard();
  const emptyMessage =
    process.env.DATABASE_URL
      ? "まだスコアがありません。ゲームをプレイして記録を残しましょう。"
      : "DATABASE_URL が未設定です。.env.local を設定して DB を接続してください。";

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <h1 className="text-3xl font-bold text-white">Leaderboard</h1>
        <p className="mt-2 text-slate-400">最多クリック数 TOP 50</p>
        <div className="mt-8">
          <LeaderboardTable entries={entries} emptyMessage={emptyMessage} />
        </div>
        <Link href="/game" className="btn-secondary mt-8 inline-block">
          ゲームをプレイする
        </Link>
      </main>
    </div>
  );
}

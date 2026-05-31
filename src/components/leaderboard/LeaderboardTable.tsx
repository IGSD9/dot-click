import type { LeaderboardEntry } from "@/actions/score";
import { formatElapsedSeconds } from "@/lib/game/types";

type LeaderboardTableProps = {
  entries: LeaderboardEntry[];
  mode: "survival" | "speed100";
  emptyMessage?: string;
};

export function LeaderboardTable({
  entries,
  mode,
  emptyMessage = "まだスコアがありません。",
}: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <p className="rounded-2xl border border-slate-800 bg-slate-900 px-6 py-10 text-center text-slate-400">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-900 text-slate-400">
          <tr>
            <th className="px-4 py-3 font-medium">Rank</th>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium text-right">
              {mode === "survival" ? "Clicks" : "Time"}
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={`${entry.rank}-${entry.userName}`}
              className="border-t border-slate-800"
            >
              <td className="px-4 py-3 font-semibold text-indigo-400">
                #{entry.rank}
              </td>
              <td className="px-4 py-3 text-white">{entry.userName}</td>
              <td className="px-4 py-3 text-right tabular-nums text-white">
                {mode === "survival"
                  ? (entry.totalScore ?? 0).toLocaleString()
                  : `${formatElapsedSeconds(entry.elapsedMs ?? 0)} 秒`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

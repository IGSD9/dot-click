import Link from "next/link";
import { getSessionEmail } from "@/actions/score";

export async function SiteHeader() {
  const email = await getSessionEmail();

  return (
    <header className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
      <Link href="/" className="text-sm font-semibold tracking-wide text-white">
        HitArrow
      </Link>

      <nav className="flex items-center gap-4 text-sm">
        <Link href="/leaderboard" className="text-slate-400 hover:text-white">
          Ranking
        </Link>
        {email ? (
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="max-w-[140px] truncate text-indigo-400 hover:text-indigo-300"
              title={email}
            >
              {email}
            </button>
          </form>
        ) : (
          <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300">
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}

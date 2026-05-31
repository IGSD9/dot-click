import Link from "next/link";
import { getSessionEmail } from "@/actions/score";

type SiteHeaderProps = {
  subtitle?: string;
  variant?: "default" | "game";
};

const navLinkClass =
  "flex min-h-11 min-w-[4.75rem] items-center justify-center rounded-xl px-3 text-base font-medium text-slate-200 transition active:bg-slate-800 sm:min-h-0 sm:min-w-0 sm:rounded-none sm:px-0 sm:text-sm sm:text-slate-400 sm:hover:text-white";

export async function SiteHeader({
  subtitle,
  variant = "default",
}: SiteHeaderProps) {
  const email = await getSessionEmail();
  const isGame = variant === "game";

  return (
    <header
      className={`flex shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950 px-4 pb-3 pt-[max(0.625rem,env(safe-area-inset-top))] ${
        isGame ? "min-h-14" : "py-3"
      }`}
    >
      <div className="flex min-w-0 items-baseline gap-2">
        <Link
          href="/"
          className={`font-semibold tracking-wide text-white ${
            isGame ? "text-base sm:text-sm" : "text-sm"
          }`}
        >
          Dot Click
        </Link>
        {subtitle && (
          <span
            className={`truncate text-slate-500 ${
              isGame ? "text-sm sm:text-xs" : "text-xs"
            }`}
          >
            {subtitle}
          </span>
        )}
      </div>

      <nav
        className={`flex shrink-0 items-center ${isGame ? "gap-1 sm:gap-4" : "gap-4 text-sm"}`}
      >
        <Link href="/leaderboard" className={isGame ? navLinkClass : "text-slate-400 hover:text-white"}>
          Ranking
        </Link>
        {email ? (
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className={
                isGame
                  ? `${navLinkClass} max-w-[9rem] truncate text-indigo-300 sm:max-w-[140px] sm:text-indigo-400`
                  : "max-w-[140px] truncate text-indigo-400 hover:text-indigo-300"
              }
              title={email}
            >
              {email}
            </button>
          </form>
        ) : (
          <Link
            href="/auth/login"
            className={
              isGame
                ? `${navLinkClass} text-indigo-300 sm:text-indigo-400 sm:hover:text-indigo-300`
                : "text-indigo-400 hover:text-indigo-300"
            }
          >
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}

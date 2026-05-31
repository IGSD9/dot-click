export type GameMode = "survival" | "speed100";

export const GAME_MODES = {
  survival: {
    id: "survival" as const,
    name: "サバイバル",
    description: "制限時間内にクリック。3回ミスでゲームオーバー。",
    href: "/game?mode=survival",
  },
  speed100: {
    id: "speed100" as const,
    name: "20点スピード",
    description: "ランダムな点を20個タップ。何秒で終わるか競う。",
    href: "/game?mode=speed100",
  },
} as const;

export function parseGameMode(value: string | undefined): GameMode {
  return value === "speed100" ? "speed100" : "survival";
}

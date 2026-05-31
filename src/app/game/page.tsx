import { GameScreen } from "@/components/game/GameScreen";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { parseGameMode } from "@/lib/game/modes";
import { GAME_MODES } from "@/lib/game/modes";

type GamePageProps = {
  searchParams: Promise<{ mode?: string }>;
};

export default async function GamePage({ searchParams }: GamePageProps) {
  const { mode: modeParam } = await searchParams;
  const mode = parseGameMode(modeParam);
  const modeInfo = GAME_MODES[mode];

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden">
      <SiteHeader subtitle={modeInfo.name} variant="game" />
      <GameScreen mode={mode} />
    </div>
  );
}

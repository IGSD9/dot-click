import { GameScreen } from "@/components/game/GameScreen";
import { SiteHeader } from "@/components/ui/SiteHeader";

export default function GamePage() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <SiteHeader />
      <GameScreen />
    </div>
  );
}

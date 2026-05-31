"use client";

import type { GameMode } from "@/lib/game/modes";
import { SurvivalGameScreen } from "./SurvivalGameScreen";
import { Speed100GameScreen } from "./Speed100GameScreen";

type GameScreenProps = {
  mode: GameMode;
};

export function GameScreen({ mode }: GameScreenProps) {
  if (mode === "speed100") {
    return <Speed100GameScreen />;
  }
  return <SurvivalGameScreen />;
}

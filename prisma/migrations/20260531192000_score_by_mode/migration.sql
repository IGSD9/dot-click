-- Add mode and elapsed columns for per-mode leaderboards
ALTER TABLE "Score"
ADD COLUMN "mode" TEXT NOT NULL DEFAULT 'survival',
ADD COLUMN "elapsedMs" INTEGER;

-- Replace per-user unique key with per-user-per-mode key
DROP INDEX "Score_userId_key";
CREATE UNIQUE INDEX "Score_userId_mode_key" ON "Score"("userId", "mode");

-- Add mode-aware leaderboard indexes
CREATE INDEX "Score_mode_totalScore_idx" ON "Score"("mode", "totalScore" DESC);
CREATE INDEX "Score_mode_elapsedMs_idx" ON "Score"("mode", "elapsedMs" ASC);

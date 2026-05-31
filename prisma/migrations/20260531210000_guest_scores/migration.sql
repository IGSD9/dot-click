-- Allow guest scores without login
ALTER TABLE "Score" ALTER COLUMN "userId" DROP NOT NULL;
ALTER TABLE "Score" ADD COLUMN IF NOT EXISTS "guestName" TEXT;

-- userId+mode unique only when logged in (Postgres allows multiple NULL userId)
DROP INDEX IF EXISTS "Score_userId_mode_key";
CREATE UNIQUE INDEX "Score_userId_mode_key" ON "Score"("userId", "mode")
WHERE "userId" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "Score_mode_guestName_idx" ON "Score"("mode", "guestName");

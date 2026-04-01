-- Migrate achievements from the legacy integer key / requiredXp shape
-- to the current string key / tier + reward fields shape without losing
-- existing achievement and unlock rows.

ALTER TABLE "user_achievements" DROP CONSTRAINT IF EXISTS "user_achievements_achievement_id_fkey";

ALTER TABLE "achievement"
  ADD COLUMN IF NOT EXISTS "achievement_id" TEXT,
  ADD COLUMN IF NOT EXISTS "tier" INTEGER,
  ADD COLUMN IF NOT EXISTS "rewardXP" INTEGER,
  ADD COLUMN IF NOT EXISTS "rewardCoins" INTEGER;

UPDATE "achievement" AS a
SET
  "achievement_id" = COALESCE(a."achievement_id", a."achivement_id"::text),
  "tier" = COALESCE(a."tier", ranked.tier),
  "rewardXP" = COALESCE(a."rewardXP", 0),
  "rewardCoins" = COALESCE(a."rewardCoins", 0)
FROM (
  SELECT
    "achivement_id",
    ROW_NUMBER() OVER (ORDER BY "requiredXp" ASC, "achivement_id" ASC) AS tier
  FROM "achievement"
) AS ranked
WHERE a."achivement_id" = ranked."achivement_id";

ALTER TABLE "achievement"
  ALTER COLUMN "achievement_id" SET NOT NULL,
  ALTER COLUMN "tier" SET NOT NULL,
  ALTER COLUMN "rewardXP" SET NOT NULL,
  ALTER COLUMN "rewardCoins" SET NOT NULL;

ALTER TABLE "user_achievements"
  ALTER COLUMN "achievement_id" TYPE TEXT USING "achievement_id"::text;

ALTER TABLE "achievement" DROP CONSTRAINT IF EXISTS "achievement_pkey";
ALTER TABLE "achievement" ADD CONSTRAINT "achievement_pkey" PRIMARY KEY ("achievement_id");

ALTER TABLE "user_achievements"
  ADD CONSTRAINT "user_achievements_achievement_id_fkey"
  FOREIGN KEY ("achievement_id") REFERENCES "achievement"("achievement_id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "achievement"
  DROP COLUMN IF EXISTS "achivement_id",
  DROP COLUMN IF EXISTS "requiredXp";

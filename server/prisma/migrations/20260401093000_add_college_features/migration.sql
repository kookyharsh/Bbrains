ALTER TABLE "college"
ADD COLUMN IF NOT EXISTS "features" JSONB DEFAULT '{}'::jsonb;

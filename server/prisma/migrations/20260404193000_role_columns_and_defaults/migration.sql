-- Align the legacy "role" table with the current Prisma schema.
-- This fixes seed/runtime failures like: column "is_default" does not exist.

-- Add missing columns
ALTER TABLE "role" ADD COLUMN IF NOT EXISTS "college_id" INTEGER;
ALTER TABLE "role" ADD COLUMN IF NOT EXISTS "color" VARCHAR(7);
ALTER TABLE "role" ADD COLUMN IF NOT EXISTS "is_default" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "role" ADD COLUMN IF NOT EXISTS "is_system" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "role" ADD COLUMN IF NOT EXISTS "position" INTEGER NOT NULL DEFAULT 0;

-- Update constraints / indexes
DROP INDEX IF EXISTS "role_name_key";
CREATE UNIQUE INDEX IF NOT EXISTS "role_name_college_id_key" ON "role"("name", "college_id");

-- Add FK (idempotent)
DO $$
BEGIN
  ALTER TABLE "role"
    ADD CONSTRAINT "role_college_id_fkey"
    FOREIGN KEY ("college_id") REFERENCES "college"("college_id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;


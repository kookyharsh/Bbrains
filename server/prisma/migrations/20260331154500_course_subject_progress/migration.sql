ALTER TABLE "course"
    ADD COLUMN IF NOT EXISTS "subject_progress" JSONB;

ALTER TABLE "course"
    ADD COLUMN IF NOT EXISTS "subject_progress" JSONB;

ALTER TABLE "assignment"
    ADD COLUMN IF NOT EXISTS "created_by_id" TEXT,
    ADD COLUMN IF NOT EXISTS "reward_points" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "submission"
    ADD COLUMN IF NOT EXISTS "review_status" VARCHAR(20) NOT NULL DEFAULT 'submitted',
    ADD COLUMN IF NOT EXISTS "review_remark" VARCHAR(255),
    ADD COLUMN IF NOT EXISTS "reviewed_at" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "reviewed_by" TEXT,
    ADD COLUMN IF NOT EXISTS "xp_awarded_at" TIMESTAMP(3);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'assignment_created_by_id_fkey'
    ) THEN
        ALTER TABLE "assignment"
        ADD CONSTRAINT "assignment_created_by_id_fkey"
        FOREIGN KEY ("created_by_id") REFERENCES "user"("user_id")
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'submission_reviewed_by_fkey'
    ) THEN
        ALTER TABLE "submission"
        ADD CONSTRAINT "submission_reviewed_by_fkey"
        FOREIGN KEY ("reviewed_by") REFERENCES "user"("user_id")
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

ALTER TABLE "user_details"
    ADD COLUMN IF NOT EXISTS "teacher_subjects" JSONB;

ALTER TABLE "course"
    ADD COLUMN IF NOT EXISTS "class_teacher_id" TEXT;

DO $$ BEGIN
    ALTER TABLE "course"
        ADD CONSTRAINT "course_class_teacher_id_fkey"
        FOREIGN KEY ("class_teacher_id") REFERENCES "user"("user_id")
        ON DELETE SET NULL
        ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "course_class_teacher_id_key"
    ON "course"("class_teacher_id")
    WHERE "class_teacher_id" IS NOT NULL;

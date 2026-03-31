DO $$ BEGIN
    CREATE TYPE "AssessmentType" AS ENUM ('test', 'exam');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "assessment" (
    "assessment_id" SERIAL PRIMARY KEY,
    "course_id" INTEGER NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "subject" VARCHAR(100) NOT NULL,
    "topic" VARCHAR(150) NOT NULL,
    "assessment_type" "AssessmentType" NOT NULL DEFAULT 'test',
    "assessment_date" DATE NOT NULL,
    "total_marks" DECIMAL(8, 2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "assessment_result" (
    "assessment_result_id" SERIAL PRIMARY KEY,
    "assessment_id" INTEGER NOT NULL,
    "student_id" TEXT NOT NULL,
    "marks_obtained" DECIMAL(8, 2) NOT NULL,
    "remark" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DO $$ BEGIN
    ALTER TABLE "assessment"
        ADD CONSTRAINT "assessment_course_id_fkey"
        FOREIGN KEY ("course_id") REFERENCES "course"("course_id")
        ON DELETE CASCADE
        ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "assessment"
        ADD CONSTRAINT "assessment_created_by_id_fkey"
        FOREIGN KEY ("created_by_id") REFERENCES "user"("user_id")
        ON DELETE CASCADE
        ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "assessment_result"
        ADD CONSTRAINT "assessment_result_assessment_id_fkey"
        FOREIGN KEY ("assessment_id") REFERENCES "assessment"("assessment_id")
        ON DELETE CASCADE
        ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "assessment_result"
        ADD CONSTRAINT "assessment_result_student_id_fkey"
        FOREIGN KEY ("student_id") REFERENCES "user"("user_id")
        ON DELETE CASCADE
        ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "assessment_course_id_assessment_date_idx"
    ON "assessment"("course_id", "assessment_date");

CREATE INDEX IF NOT EXISTS "assessment_created_by_id_assessment_date_idx"
    ON "assessment"("created_by_id", "assessment_date");

CREATE INDEX IF NOT EXISTS "assessment_result_student_id_created_at_idx"
    ON "assessment_result"("student_id", "created_at" DESC);

CREATE UNIQUE INDEX IF NOT EXISTS "assessment_result_assessment_id_student_id_key"
    ON "assessment_result"("assessment_id", "student_id");

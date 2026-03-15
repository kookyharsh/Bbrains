-- Align database schema with Prisma model `Attendance` (markedBy + notes).

ALTER TABLE "attendance"
ADD COLUMN IF NOT EXISTS "marked_by" TEXT,
ADD COLUMN IF NOT EXISTS "notes" TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'attendance_marked_by_fkey'
  ) THEN
    ALTER TABLE "attendance"
    ADD CONSTRAINT "attendance_marked_by_fkey"
    FOREIGN KEY ("marked_by") REFERENCES "user"("user_id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;
  END IF;
END $$;


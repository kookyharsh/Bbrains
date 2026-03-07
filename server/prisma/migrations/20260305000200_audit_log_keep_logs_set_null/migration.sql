-- Keep audit logs when a user is deleted:
-- make user_id nullable and set FK behavior to SET NULL
ALTER TABLE "audit_log"
ALTER COLUMN "user_id" DROP NOT NULL;

ALTER TABLE "audit_log" DROP CONSTRAINT IF EXISTS "audit_log_user_id_fkey";

ALTER TABLE "audit_log"
ADD CONSTRAINT "audit_log_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "user"("user_id")
ON DELETE SET NULL
ON UPDATE CASCADE;

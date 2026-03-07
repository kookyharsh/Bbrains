-- Change audit_log -> user FK to cascade on user delete
ALTER TABLE "audit_log" DROP CONSTRAINT IF EXISTS "audit_log_user_id_fkey";

ALTER TABLE "audit_log"
ADD CONSTRAINT "audit_log_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "user"("user_id")
ON DELETE CASCADE
ON UPDATE CASCADE;

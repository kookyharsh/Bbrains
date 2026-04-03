ALTER TABLE "transaction_history"
ADD COLUMN IF NOT EXISTS "recorded_by_id" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "related_user_id" VARCHAR(255),
ADD COLUMN IF NOT EXISTS "entry_group_id" VARCHAR(64),
ADD COLUMN IF NOT EXISTS "category" VARCHAR(30) NOT NULL DEFAULT 'other',
ADD COLUMN IF NOT EXISTS "payment_mode" VARCHAR(30),
ADD COLUMN IF NOT EXISTS "reference_id" VARCHAR(100),
ADD COLUMN IF NOT EXISTS "primary_record" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS "transaction_history_recorded_by_id_primary_record_transaction_date_idx"
ON "transaction_history"("recorded_by_id", "primary_record", "transaction_date" DESC);

CREATE INDEX IF NOT EXISTS "transaction_history_related_user_id_idx"
ON "transaction_history"("related_user_id");

CREATE INDEX IF NOT EXISTS "transaction_history_category_transaction_date_idx"
ON "transaction_history"("category", "transaction_date" DESC);

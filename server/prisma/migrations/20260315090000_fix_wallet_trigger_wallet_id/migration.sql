-- Fix wallet_id generation for user IDs that don't contain an underscore (e.g. Supabase UUIDs).
-- Previously, split_part(NEW."user_id", '_', 2) returned '' for UUIDs, producing wallet_id = 'wallet_' for every user.

CREATE OR REPLACE FUNCTION create_user_wallet_func()
RETURNS TRIGGER AS $$
DECLARE
  wallet_suffix TEXT;
BEGIN
  wallet_suffix := NULLIF(split_part(NEW."user_id", '_', 2), '');

  IF wallet_suffix IS NULL THEN
    wallet_suffix := NEW."user_id";
  END IF;

  INSERT INTO "wallet" ("wallet_id", "user_id", "balance", "pin")
  VALUES ('wallet_' || wallet_suffix, NEW."user_id", 500.00, '000000')
  ON CONFLICT ("user_id") DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


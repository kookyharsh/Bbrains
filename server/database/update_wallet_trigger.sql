CREATE OR REPLACE FUNCTION create_user_wallet_func() 
RETURNS TRIGGER AS $$
BEGIN
  -- Using user's email as wallet_id
  INSERT INTO "wallet" ("wallet_id", "user_id", "balance", "pin")
  VALUES (NEW."email", NEW."user_id", 500.00, '000000')
  ON CONFLICT ("user_id") DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- This is an empty migration.

-- ==========================================================
-- 1. AUTOMATIC WALLET CREATION
-- Trigger: Creates a wallet with 500 coins when a User is created
-- ==========================================================

CREATE OR REPLACE FUNCTION create_user_wallet_func() 
RETURNS TRIGGER AS $$
BEGIN
  -- Insert a new wallet linked to the new user ID
  INSERT INTO "wallet" ("wallet_id", "user_id", "balance", "pin")
  VALUES ('wallet_' || split_part(NEW."user_id", '_', 2), NEW."user_id", 500.00, '000000')
  ON CONFLICT ("user_id") DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_wallet_on_signup
AFTER INSERT ON "user"
FOR EACH ROW
EXECUTE FUNCTION create_user_wallet_func();


-- ==========================================================
-- 2. DYNAMIC LEVEL CALCULATION
-- Function: Calculates Level based on XP from the "Level" table
-- Trigger: Updates User's Level whenever their XP changes
-- ==========================================================

-- Function to find the correct level for a given XP amount
CREATE OR REPLACE FUNCTION calculate_level_from_xp(current_xp DECIMAL) 
RETURNS INT AS $$
DECLARE
  calc_level INT;
BEGIN
  -- Find the highest level where requiredXp is less than or equal to current_xp
  SELECT "levelNumber" INTO calc_level
  FROM "level"
  WHERE "requiredXp" <= current_xp
  ORDER BY "requiredXp" DESC
  LIMIT 1;

  -- Default to Level 1 if no match found
  RETURN COALESCE(calc_level, 1);
END;
$$ LANGUAGE plpgsql;

-- Trigger Function to update the XP table
CREATE OR REPLACE FUNCTION update_level_on_xp_change_func() 
RETURNS TRIGGER AS $$
BEGIN
  -- Only run if XP has actually changed
  IF NEW.xp IS DISTINCT FROM OLD.xp THEN
    NEW.level := calculate_level_from_xp(NEW.xp);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_level_up
BEFORE UPDATE ON "xp"
FOR EACH ROW
EXECUTE FUNCTION update_level_on_xp_change_func();


-- ==========================================================
-- 3. THE "MASTER" AUDIT LOGGER
-- Trigger: Logs INSERT, UPDATE, DELETE for almost every table
-- ==========================================================

CREATE OR REPLACE FUNCTION master_audit_logger_func() 
RETURNS TRIGGER AS $$
DECLARE
  log_category "LogCategory";
  target_user_id TEXT;
  entity_id TEXT;
  payload JSONB;
  action_type TEXT;
BEGIN
  IF (TG_OP = 'INSERT') THEN
    action_type := 'CREATE';
    payload := row_to_json(NEW);

    BEGIN
      entity_id := CAST(NEW.id AS TEXT);
    EXCEPTION WHEN OTHERS THEN
      entity_id := NULL;
    END;

    BEGIN
      target_user_id := CAST(NEW."user_id" AS TEXT);
    EXCEPTION WHEN OTHERS THEN
      target_user_id := NULL;
    END;

  ELSIF (TG_OP = 'UPDATE') THEN
    action_type := 'UPDATE';
    payload := json_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW));

    BEGIN
      entity_id := CAST(NEW.id AS TEXT);
    EXCEPTION WHEN OTHERS THEN
      entity_id := NULL;
    END;

    BEGIN
      target_user_id := CAST(NEW."user_id" AS TEXT);
    EXCEPTION WHEN OTHERS THEN
      target_user_id := NULL;
    END;

  ELSIF (TG_OP = 'DELETE') THEN
    action_type := 'DELETE';
    payload := row_to_json(OLD);

    BEGIN
      entity_id := CAST(OLD.id AS TEXT);
    EXCEPTION WHEN OTHERS THEN
      entity_id := NULL;
    END;

    BEGIN
      target_user_id := CAST(OLD."user_id" AS TEXT);
    EXCEPTION WHEN OTHERS THEN
      target_user_id := NULL;
    END;
  END IF;

  log_category := CASE TG_TABLE_NAME
    WHEN 'user' THEN 'AUTH'::"LogCategory"
    WHEN 'user_details' THEN 'USER'::"LogCategory"
    WHEN 'user_roles' THEN 'USER'::"LogCategory"
    WHEN 'user_achievements' THEN 'USER'::"LogCategory"
    WHEN 'college' THEN 'SYSTEM'::"LogCategory"
    WHEN 'course' THEN 'ACADEMIC'::"LogCategory"
    WHEN 'enrollment' THEN 'ACADEMIC'::"LogCategory"
    WHEN 'assignment' THEN 'ACADEMIC'::"LogCategory"
    WHEN 'submission' THEN 'ACADEMIC'::"LogCategory"
    WHEN 'grade' THEN 'ACADEMIC'::"LogCategory"
    WHEN 'announcement' THEN 'SYSTEM'::"LogCategory"
    WHEN 'product' THEN 'MARKET'::"LogCategory"
    WHEN 'order' THEN 'FINANCE'::"LogCategory"
    WHEN 'cart' THEN 'MARKET'::"LogCategory"
    WHEN 'transaction_history' THEN 'FINANCE'::"LogCategory"
    ELSE 'SYSTEM'::"LogCategory"
  END;

  -- ⭐ FIX: Special handling for "user" table - use the user_id column as both entity and actor
  IF TG_TABLE_NAME = 'user' THEN
    IF TG_OP = 'DELETE' THEN
      target_user_id := CAST(OLD."user_id" AS TEXT);
      entity_id := CAST(OLD."user_id" AS TEXT);
    ELSE 
      target_user_id := CAST(NEW."user_id" AS TEXT);
      entity_id := CAST(NEW."user_id" AS TEXT);
    END IF;
  END IF;

  -- ⭐ FIX: Only insert audit log if we have a valid user_id
  IF target_user_id IS NOT NULL AND target_user_id != '' THEN
    BEGIN
      INSERT INTO "audit_log" (
      "user_id", "category", "action", "entity", "entityId", "change", "reason", "created_at"
    ) VALUES (
      target_user_id, log_category, action_type, TG_TABLE_NAME, entity_id,
      payload, 'Auto-logged via DB Trigger', NOW()
    );
    EXCEPTION WHEN OTHERS THEN
      -- Log the error, but don't prevent the original operation from completing
      -- You might want to log this to a separate error log table or system log
      RAISE WARNING 'Failed to insert audit log for table %: %', TG_TABLE_NAME, SQLERRM;
    END;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;


-- ==========================================================
-- 4. ATTACH AUDIT TRIGGER TO TABLES
-- ==========================================================

-- User & Profile
CREATE TRIGGER trg_audit_user AFTER INSERT OR UPDATE OR DELETE ON "user" FOR EACH ROW EXECUTE FUNCTION master_audit_logger_func();
CREATE TRIGGER trg_audit_details AFTER INSERT OR UPDATE OR DELETE ON "user_details" FOR EACH ROW EXECUTE FUNCTION master_audit_logger_func();
CREATE TRIGGER trg_audit_roles AFTER INSERT OR UPDATE OR DELETE ON "user_roles" FOR EACH ROW EXECUTE FUNCTION master_audit_logger_func();
CREATE TRIGGER trg_audit_achievement AFTER INSERT OR UPDATE OR DELETE ON "user_achievements" FOR EACH ROW EXECUTE FUNCTION master_audit_logger_func();

-- Academic
CREATE TRIGGER trg_audit_college AFTER INSERT OR UPDATE OR DELETE ON "college" FOR EACH ROW EXECUTE FUNCTION master_audit_logger_func();
CREATE TRIGGER trg_audit_course AFTER INSERT OR UPDATE OR DELETE ON "course" FOR EACH ROW EXECUTE FUNCTION master_audit_logger_func();
CREATE TRIGGER trg_audit_enroll AFTER INSERT OR UPDATE OR DELETE ON "enrollment" FOR EACH ROW EXECUTE FUNCTION master_audit_logger_func();
CREATE TRIGGER trg_audit_assign AFTER INSERT OR UPDATE OR DELETE ON "assignment" FOR EACH ROW EXECUTE FUNCTION master_audit_logger_func();
CREATE TRIGGER trg_audit_submit AFTER INSERT OR UPDATE OR DELETE ON "submission" FOR EACH ROW EXECUTE FUNCTION master_audit_logger_func();
CREATE TRIGGER trg_audit_grade AFTER INSERT OR UPDATE OR DELETE ON "grade" FOR EACH ROW EXECUTE FUNCTION master_audit_logger_func();
CREATE TRIGGER trg_audit_announce AFTER INSERT OR UPDATE OR DELETE ON "announcement" FOR EACH ROW EXECUTE FUNCTION master_audit_logger_func();

-- Market & Finance
CREATE TRIGGER trg_audit_product AFTER INSERT OR UPDATE OR DELETE ON "product" FOR EACH ROW EXECUTE FUNCTION master_audit_logger_func();
CREATE TRIGGER trg_audit_order AFTER INSERT OR UPDATE OR DELETE ON "order" FOR EACH ROW EXECUTE FUNCTION master_audit_logger_func();
CREATE TRIGGER trg_audit_cart AFTER INSERT OR UPDATE OR DELETE ON "cart" FOR EACH ROW EXECUTE FUNCTION master_audit_logger_func();
CREATE TRIGGER trg_audit_trans AFTER INSERT OR UPDATE OR DELETE ON "transaction_history" FOR EACH ROW EXECUTE FUNCTION master_audit_logger_func();
-- Note: We generally don't audit 'audit_log' itself to prevent infinite loops!

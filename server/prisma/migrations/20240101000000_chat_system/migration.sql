
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "teacher_id" TEXT NOT NULL,
    "class_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_message_at" TIMESTAMP(3),

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT,
    "sender_id" TEXT NOT NULL,
    "sender_role" TEXT NOT NULL,
    "sender_name" TEXT NOT NULL,
    "sender_avatar_url" TEXT,
    "content" TEXT NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "conversation_id" TEXT,
    "type" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "subscription" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "conversations_student_id_teacher_id_class_id_key" ON "conversations"("student_id", "teacher_id", "class_id");

ALTER TABLE "conversations" ADD CONSTRAINT "conversations_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_class_id_fkey" FOREIGN KEY ("class_id") REFERENCES "course"("course_id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "user"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Enable RLS on the new tables
ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "push_subscriptions" ENABLE ROW LEVEL SECURITY;

-- 1. Policies for "messages"
CREATE POLICY "Select global messages" ON "messages"
FOR SELECT USING (conversation_id IS NULL AND is_deleted = false AND auth.role() = 'authenticated');

CREATE POLICY "Insert global message" ON "messages"
FOR INSERT WITH CHECK (conversation_id IS NULL AND auth.role() = 'authenticated');

CREATE POLICY "Soft delete global message" ON "messages"
FOR UPDATE USING (
  conversation_id IS NULL AND (
    sender_id = auth.uid()::text
    OR (SELECT type::text FROM "user" WHERE user_id = auth.uid()::text) IN ('teacher', 'admin', 'superadmin', 'staff')
  )
) WITH CHECK (is_deleted = true AND deleted_by = auth.uid()::text);

CREATE POLICY "Select DM messages" ON "messages"
FOR SELECT USING (
  conversation_id IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM "conversations" c
      WHERE c.id = conversation_id AND (c.student_id = auth.uid()::text OR c.teacher_id = auth.uid()::text)
    )
  )
);

CREATE POLICY "Insert DM messages" ON "messages"
FOR INSERT WITH CHECK (
  conversation_id IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM "conversations" c
      WHERE c.id = conversation_id AND (c.student_id = auth.uid()::text OR c.teacher_id = auth.uid()::text)
    )
  )
);

CREATE POLICY "Update DM messages" ON "messages"
FOR UPDATE USING (
  conversation_id IS NOT NULL AND (
    sender_id = auth.uid()::text OR EXISTS (
      SELECT 1 FROM "conversations" c
      WHERE c.id = conversation_id AND (c.student_id = auth.uid()::text OR c.teacher_id = auth.uid()::text)
    )
  )
);

-- 2. Policies for "conversations"
CREATE POLICY "Select conversations" ON "conversations"
FOR SELECT USING (student_id = auth.uid()::text OR teacher_id = auth.uid()::text);

CREATE POLICY "Insert conversation" ON "conversations"
FOR INSERT WITH CHECK (
  student_id = auth.uid()::text AND (
    EXISTS (
      SELECT 1 FROM "enrollment" e
      JOIN "course" c ON e.course_id = c.course_id
      WHERE e.user_id = auth.uid()::text AND c.class_teacher_id = teacher_id AND c.course_id = class_id
    )
  )
);

-- 3. Policies for "notifications" (ChatNotification)
CREATE POLICY "Select update own notifications" ON "notifications"
FOR ALL USING (user_id = auth.uid()::text);

-- 4. Policies for "push_subscriptions"
CREATE POLICY "All operations on own push_subscriptions" ON "push_subscriptions"
FOR ALL USING (user_id = auth.uid()::text);

-- Database Trigger for creating notifications
CREATE OR REPLACE FUNCTION process_message_notification()
RETURNS TRIGGER AS $$
DECLARE
    conv RECORD;
BEGIN
    IF NEW.conversation_id IS NOT NULL THEN
        -- DM Message
        SELECT student_id, teacher_id INTO conv FROM "conversations" WHERE id = NEW.conversation_id;
        IF NEW.sender_id = conv.student_id THEN
            INSERT INTO "notifications" (id, user_id, message_id, conversation_id, type)
            VALUES (gen_random_uuid()::text, conv.teacher_id, NEW.id, NEW.conversation_id, 'dm');
        ELSE
            INSERT INTO "notifications" (id, user_id, message_id, conversation_id, type)
            VALUES (gen_random_uuid()::text, conv.student_id, NEW.id, NEW.conversation_id, 'dm');
        END IF;
    ELSE
        INSERT INTO "notifications" (id, user_id, message_id, type)
        SELECT gen_random_uuid()::text, u.user_id, NEW.id, 'global'
        FROM "user" u
        WHERE u.user_id != NEW.sender_id AND u.type::text IN ('student', 'teacher');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_message_notification ON "messages";
CREATE TRIGGER trg_message_notification
AFTER INSERT ON "messages"
FOR EACH ROW
EXECUTE FUNCTION process_message_notification();


-- Realtime Setup
ALTER TABLE "messages" REPLICA IDENTITY FULL;
ALTER TABLE "notifications" REPLICA IDENTITY FULL;
ALTER TABLE "conversations" REPLICA IDENTITY FULL;

begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;

alter publication supabase_realtime add table "messages";
alter publication supabase_realtime add table "notifications";
alter publication supabase_realtime add table "conversations";

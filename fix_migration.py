import os

migration_dir = "server/prisma/migrations/000000000000_chat_system"
migration_file = os.path.join(migration_dir, "migration.sql")
rls_file = os.path.join(migration_dir, "supabase_rls_realtime.sql")

with open(migration_file, "r") as f:
    sql = f.read()

# Strip any DROP TABLE or CREATE TABLE that is not our new tables
lines = sql.splitlines()
new_lines = []
skip = False
for line in lines:
    if line.startswith('CREATE TABLE "conversations"'):
        skip = False
    elif line.startswith('CREATE TABLE "messages"'):
        skip = False
    elif line.startswith('CREATE TABLE "notifications"'):
        skip = False
    elif line.startswith('CREATE TABLE "push_subscriptions"'):
        skip = False

    # We want to keep CREATE TABLE for our tables and ALTER TABLE ADD CONSTRAINT for our tables.
    # It's safer to just re-generate the migration script diff from the previous state if we had it.
    pass

CREATE OR REPLACE VIEW "leaderboard_view" AS
SELECT
  u."user_id" AS "userId",
  u."username",
  ud."first_name" AS "firstName",
  ud."last_name" AS "lastName",
  ud."avatar",
  COALESCE(x."xp", 0) AS "totalXp",
  COALESCE(w."balance", 0) AS "totalPoints",
  RANK() OVER (ORDER BY COALESCE(x."xp", 0) DESC) AS "xpRank",
  RANK() OVER (ORDER BY COALESCE(w."balance", 0) DESC) AS "pointsRank"
FROM "user" u
LEFT JOIN "xp" x ON x."user_id" = u."user_id"
LEFT JOIN "wallet" w ON w."user_id" = u."user_id"
LEFT JOIN "user_details" ud ON ud."user_id" = u."user_id"
WHERE u."type" = 'student';

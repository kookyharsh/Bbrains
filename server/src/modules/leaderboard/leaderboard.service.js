import prisma from '../../utils/prisma.js';

export const getLeaderboard = async (sortBy = 'xp', limit = 20, offset = 0) => {
    const rankCol = sortBy === 'points' ? '"pointsRank"' : '"xpRank"';
    const valueCol = sortBy === 'points' ? '"totalPoints"' : '"totalXp"';

    const rows = await prisma.$queryRawUnsafe(
        `SELECT "userId", "username", "firstName", "lastName", "avatar",
                COALESCE("totalXp", 0)::int AS "totalXp",
                COALESCE("totalPoints", 0)::int AS "totalPoints",
                COALESCE(${rankCol}, 0)::int AS rank,
                COALESCE(${valueCol}, 0)::int AS value
         FROM "leaderboard_view"
         ORDER BY ${rankCol} ASC, "username" ASC
         LIMIT $1 OFFSET $2`,
        limit,
        offset
    );

    return rows;
};

export const getMyPosition = async (userId, sortBy = 'xp') => {
    const rankCol = sortBy === 'points' ? '"pointsRank"' : '"xpRank"';

    const rows = await prisma.$queryRawUnsafe(
        `SELECT "userId", "username", "firstName", "lastName", "avatar",
                COALESCE("totalXp", 0)::int AS "totalXp",
                COALESCE("totalPoints", 0)::int AS "totalPoints",
                COALESCE(${rankCol}, 0)::int AS rank
         FROM "leaderboard_view"
         WHERE "userId" = $1`,
        userId
    );

    return rows[0] || null;
};

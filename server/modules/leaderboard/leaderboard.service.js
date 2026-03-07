import prisma from '../../utils/prisma.js';

export const getLeaderboard = async (category = 'allTime', limit = 20, offset = 0) => {
    return await prisma.leaderboard.findMany({
        where: { category },
        orderBy: { score: 'desc' },
        take: limit,
        skip: offset,
        include: {
            user: {
                select: {
                    username: true,
                    userDetails: { select: { avatar: true, firstName: true, lastName: true } }
                }
            }
        }
    });
};

export const getMyPosition = async (userId, category = 'allTime') => {
    const entry = await prisma.leaderboard.findFirst({
        where: { userId, category }
    });
    return entry;
};

export const refreshLeaderboard = async (category = 'allTime') => {
    // Get all users with XP
    const users = await prisma.xp.findMany({
        orderBy: { xp: 'desc' },
        include: { user: { select: { id: true } } }
    });

    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Upsert leaderboard entries
    for (let i = 0; i < users.length; i++) {
        await prisma.leaderboard.upsert({
            where: {
                userId_category_periodStart: {
                    userId: users[i].userId,
                    category,
                    periodStart
                }
            },
            update: {
                score: users[i].xp,
                rank: i + 1
            },
            create: {
                userId: users[i].userId,
                score: users[i].xp,
                category,
                periodStart,
                rank: i + 1
            }
        });
    }

    return { updated: users.length };
};

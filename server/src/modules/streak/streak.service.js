import prisma from '../../utils/prisma.js';

export const getStreak = async (userId) => {
    let streak = await prisma.streak.findUnique({ where: { userId } });
    if (!streak) {
        streak = await prisma.streak.create({ data: { userId } });
    }
    return streak;
};

export const claimDailyPoints = async (userId) => {
    const streak = await getStreak(userId);
    const now = new Date();

    if (streak.lastClaimedAt) {
        const timeDiff = now.getTime() - streak.lastClaimedAt.getTime();
        const hoursPassed = timeDiff / (1000 * 60 * 60);

        if (hoursPassed < 24) {
            throw new Error('Already claimed today. Please wait 24 hours.');
        }

        // Reset streak if more than 48 hours have passed
        if (hoursPassed > 48) {
            streak.currentStreak = 0;
        }
    }

    return await prisma.$transaction(async (tx) => {
        const currentXp = await tx.xp.findUnique({ where: { userId } });
        if (currentXp) {
            await tx.xp.update({
                where: { userId },
                data: { xp: { increment: 50 } }
            });
        } else {
            await tx.xp.create({
                data: { userId, xp: 50, level: 1 }
            });
        }

        return await tx.streak.update({
            where: { userId },
            data: {
                currentStreak: streak.currentStreak + 1,
                lastClaimedAt: now
            }
        });
    });
};

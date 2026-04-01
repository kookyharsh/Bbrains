import prisma from '../../utils/prisma.js';

export const getStreak = async (userId) => {
    let streak = await prisma.streak.findUnique({
        where: { userId }
    });

    if (!streak) {
        streak = await prisma.streak.create({
            data: {
                userId,
                currentStreak: 0
            }
        });
    }

    return streak;
};

export const claimDailyPoints = async (userId) => {
    const streak = await getStreak(userId);
    const now = new Date();

    if (streak.lastClaimedAt) {
        const lastClaim = new Date(streak.lastClaimedAt);
        const timeDiff = now.getTime() - lastClaim.getTime();
        const hoursPassed = timeDiff / (1000 * 60 * 60);

        if (hoursPassed < 24) {
            throw new Error('Already claimed today. Please wait 24 hours.');
        }

        // Reset streak if more than 48 hours have passed
        if (hoursPassed > 48) {
            streak.currentStreak = 0;
        }
    }

    const XP_REWARDS = [50, 50, 75, 75, 100, 100, 200];
    const dayIndex = (streak.currentStreak || 0) % 7;
    const rewardXP = XP_REWARDS[dayIndex];

    return await prisma.$transaction(async (tx) => {
        // 1. Award XP
        await tx.user.update({
            where: { id: userId },
            data: {
                xp: { increment: rewardXP }
            }
        });

        // 2. Log Action
        await tx.auditLog.create({
            data: {
                user: { connect: { id: userId } },
                category: 'SYSTEM',
                action: 'DAILY_CLAIM',
                entity: 'User',
                entityId: userId,
                change: { xp: rewardXP, day: dayIndex + 1 }
            }
        });

        // 3. Update Streak
        return await tx.streak.update({
            where: { userId },
            data: {
                currentStreak: (streak.currentStreak || 0) + 1,
                lastClaimedAt: now
            }
        });
    });
};

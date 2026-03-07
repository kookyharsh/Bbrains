import prisma from '../../utils/prisma.js';

export const createAchievementRecord = async (data) => {
    return await prisma.achievement.create({ data });
};

export const getAllAchievements = async () => {
    return await prisma.achievement.findMany({ orderBy: { requiredXp: 'asc' } });
};

export const getAchievementById = async (id) => {
    return await prisma.achievement.findUnique({ where: { id } });
};

export const updateAchievementRecord = async (id, data) => {
    return await prisma.achievement.update({ where: { id }, data });
};

export const deleteAchievementRecord = async (id) => {
    return await prisma.achievement.delete({ where: { id } });
};

export const getUserAchievements = async (userId) => {
    return await prisma.userAchievements.findMany({
        where: { userId },
        include: { achievement: true }
    });
};

export const unlockAchievement = async (userId, achievementId) => {
    return await prisma.userAchievements.create({
        data: { userId, achievementId }
    });
};

// Auto-unlock achievements based on XP
export const checkAndUnlockAchievements = async (userId) => {
    const xp = await prisma.xp.findUnique({ where: { userId } });
    if (!xp) return [];

    const unlockedIds = (await prisma.userAchievements.findMany({
        where: { userId }, select: { achievementId: true }
    })).map(ua => ua.achievementId);

    const eligibleAchievements = await prisma.achievement.findMany({
        where: {
            id: { notIn: unlockedIds },
            requiredXp: { lte: xp.xp }
        }
    });

    const newlyUnlocked = [];
    for (const achievement of eligibleAchievements) {
        await prisma.userAchievements.create({
            data: { userId, achievementId: achievement.id }
        });
        newlyUnlocked.push(achievement);
    }

    return newlyUnlocked;
};

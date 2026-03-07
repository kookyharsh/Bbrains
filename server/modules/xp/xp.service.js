import prisma from '../../utils/prisma.js';

export const getXpByUserId = async (userId) => {
    return await prisma.xp.findUnique({ where: { userId } });
};

export const awardXpToUser = async (userId, amount) => {
    const xp = await prisma.xp.upsert({
        where: { userId },
        update: { xp: { increment: amount } },
        create: { userId, xp: amount, level: 1 }
    });

    // Auto-level-up check
    const nextLevel = await prisma.level.findFirst({
        where: { levelNumber: xp.level + 1 }
    });

    if (nextLevel && Number(xp.xp) >= Number(nextLevel.requiredXp)) {
        return await prisma.xp.update({
            where: { userId },
            data: { level: { increment: 1 } }
        });
    }

    return xp;
};

export const getAllLevels = async () => {
    return await prisma.level.findMany({ orderBy: { levelNumber: 'asc' } });
};

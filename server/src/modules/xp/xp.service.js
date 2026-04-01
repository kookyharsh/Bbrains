import prisma from '../../utils/prisma.js';
import { createNotification } from '../notification/notification.service.js';

export const getXpByUserId = async (userId) => {
    return await prisma.xp.findUnique({ where: { userId } });
};

export const autoAssignRoles = async (userId, level) => {
    // Example: Level 5 -> "Senior Student", Level 10 -> "Elite Student"
    // First, find or ensure these roles exist
    const roles = await prisma.role.findMany({
        where: { name: { in: ['Senior Student', 'Elite Student'] } }
    });

    const seniorRole = roles.find(r => r.name === 'Senior Student');
    const eliteRole = roles.find(r => r.name === 'Elite Student');

    if (level >= 10 && eliteRole) {
        await prisma.userRoles.upsert({
            where: { userId_roleId: { userId, roleId: eliteRole.id } },
            create: { userId, roleId: eliteRole.id },
            update: {}
        });
    } else if (level >= 5 && seniorRole) {
        await prisma.userRoles.upsert({
            where: { userId_roleId: { userId, roleId: seniorRole.id } },
            create: { userId, roleId: seniorRole.id },
            update: {}
        });
    }
};

export const checkAchievements = async (userId, xpAmount, level) => {
    // Achievement unlocks now track level-based tiers instead of required XP thresholds.
    const achievements = await prisma.achievement.findMany();
    const userAchievements = await prisma.userAchievements.findMany({ where: { userId } });
    const unlockedIds = userAchievements.map(ua => ua.achievementId);

    for (const ach of achievements) {
        if (!unlockedIds.includes(ach.id) && Number(level) >= Number(ach.tier)) {
            await prisma.userAchievements.create({
                data: { userId, achievementId: ach.id }
            });

            // Notify achievement unlock
            await createNotification(
                userId,
                'Achievement Unlocked!',
                `You've earned the "${ach.name}" achievement!`,
                'achievement',
                ach.id.toString()
            );
        }
    }
};

export const awardXpToUser = async (userId, amount) => {
    const xpRecord = await prisma.xp.upsert({
        where: { userId },
        update: { xp: { increment: amount } },
        create: { userId, xp: amount, level: 1 }
    });

    // Notify XP award
    await createNotification(
        userId,
        'XP Awarded!',
        `You have been awarded ${amount} XP.`,
        'achievement'
    );

    // Check for achievements based on total XP
    await checkAchievements(userId, xpRecord.xp, xpRecord.level);

    // Auto-level-up check
    const nextLevel = await prisma.level.findFirst({
        where: { levelNumber: xpRecord.level + 1 }
    });

    if (nextLevel && Number(xpRecord.xp) >= Number(nextLevel.requiredXp)) {
        const updated = await prisma.xp.update({
            where: { userId },
            data: { level: { increment: 1 } }
        });

        // Notify Level Up
        await createNotification(
            userId,
            'Level Up!',
            `Congratulations! You've reached Level ${updated.level}!`,
            'achievement'
        );

        // Auto assign roles based on new level
        await autoAssignRoles(userId, updated.level);

        return updated;
    }

    return xpRecord;
};

export const getAllLevels = async () => {
    return await prisma.level.findMany({ orderBy: { levelNumber: 'asc' } });
};

// Admin: create a new level threshold
export const createLevel = async (levelNumber, requiredXp) => {
    return await prisma.level.create({ data: { levelNumber, requiredXp } });
};

// Admin: update an existing level threshold
export const updateLevel = async (levelNumber, requiredXp) => {
    return await prisma.level.update({ where: { levelNumber }, data: { requiredXp } });
};

// Admin: delete a level by levelNumber
export const deleteLevel = async (levelNumber) => {
    return await prisma.level.delete({ where: { levelNumber } });
};

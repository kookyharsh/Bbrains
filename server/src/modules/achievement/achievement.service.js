import prisma from '../../utils/prisma.js';
import { getChatSocket } from '../chat/chat.socket.js';

export const createAchievementRecord = async (data) => {
    return await prisma.achievement.create({ data });
};

export const getAllAchievements = async (collegeId) => {
    return await prisma.achievement.findMany({ 
        where: collegeId ? { collegeId } : {},
        orderBy: { tier: 'asc' } 
    });
};

export const getAchievementById = async (id) => {
    return await prisma.achievement.findUnique({ where: { id } });
};

export const getAchievementByName = async (name) => {
    return await prisma.achievement.findFirst({ where: { name } });
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
        include: { achievement: true },
        orderBy: { unlockedAt: 'desc' }
    });
};

export const unlockAchievement = async (userId, achievementId) => {
    return await prisma.userAchievements.create({
        data: { userId, achievementId }
    });
};

// Auto-unlock achievements based on actions
export const awardAchievement = async (userId, achievementName) => {
    try {
        // 1. Check if achievements are globally enabled
        const config = await prisma.systemConfig.findUnique({
            where: { key: 'achievements_enabled' }
        });

        if (config && config.value !== 'true') {
            return null; // Achievements are disabled
        }

        // 2. Find the achievement by name
        const achievement = await getAchievementByName(achievementName);
        if (!achievement) return null; // Achievement doesn't exist

        // 3. Check if user already unlocked it
        const existing = await prisma.userAchievements.findUnique({
            where: {
                userId_achievementId: {
                    userId: userId,
                    achievementId: achievement.id
                }
            }
        });

        if (existing) return null; // Already unlocked

        // 4. Unlock it
        const unlocked = await unlockAchievement(userId, achievement.id);

        // 5. Award XP and Coins
        if (achievement.rewardXP > 0) {
            await prisma.xp.upsert({
                where: { userId },
                update: { xp: { increment: achievement.rewardXP } },
                create: { userId, xp: achievement.rewardXP, level: 1 }
            });
        }

        if (achievement.rewardCoins > 0) {
            await prisma.wallet.update({
                where: { userId },
                data: { balance: { increment: achievement.rewardCoins } }
            }).catch(() => { /* Ignore if user has no wallet */ });
        }

        // 6. Trigger Real-time notification
        const io = getChatSocket();
        if (io) {
            io.to(userId).emit('achievement_unlocked', {
                id: achievement.id,
                name: achievement.name,
                description: achievement.description,
                icon: achievement.icon,
                rewardXP: achievement.rewardXP,
                rewardCoins: achievement.rewardCoins,
                unlockedAt: unlocked.unlockedAt
            });
        }

        return achievement;
    } catch (error) {
        console.error('Error awarding achievement:', error);
        return null;
    }
};

import prisma from "../../utils/prisma.js";
import { deleteSupabaseUser } from "../auth/supabase-user.service.js";

const updateUser = async (id, data) => {
    return await prisma.user.update({
        where: { id: id },
        data: data
    });
};

const deleteUser = async (id) => {
    try {
        await deleteSupabaseUser(id);
    } catch (error) {
        console.error('Failed to delete Supabase user:', error);
        throw error;
    }

    return await prisma.user.delete({
        where: { id: id }
    });
};

const claimDailyRewards = async (userId) => {
    // Check if user has claimed in the last 24 hours
    const lastClaim = await prisma.auditLog.findFirst({
        where: {
            userId: userId,
            action: "DAILY_CLAIM",
            createdAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    if (lastClaim) {
        throw new Error("Daily reward already claimed in the last 24 hours");
    }

    // Define rewards
    const rewardXP = 50;
    const rewardCoins = 100;

    // Use a transaction to ensure all updates succeed or fail together
    return await prisma.$transaction(async (tx) => {
        // 1. Update/Create XP
        await tx.xp.upsert({
            where: { userId: userId },
            update: {
                xp: { increment: rewardXP }
            },
            create: {
                userId: userId,
                xp: rewardXP,
                level: 1
            }
        });

        // 2. Update/Create Wallet (Coins)
        await tx.wallet.upsert({
            where: { userId: userId },
            update: {
                balance: { increment: rewardCoins }
            },
            create: {
                id: crypto.randomUUID(),
                userId: userId,
                balance: rewardCoins,
                pin: "000000"
            }
        });

        // 3. Log the action
        await tx.auditLog.create({
            data: {
                userId: userId,
                category: "SYSTEM",
                action: "DAILY_CLAIM",
                entity: "User",
                entityId: userId
            }
        });

        return { xp: rewardXP, coins: rewardCoins };
    });
};

export { updateUser, deleteUser, claimDailyRewards };

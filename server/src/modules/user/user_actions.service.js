import prisma from "../../utils/prisma.js";
import { deleteSupabaseUser } from "../auth/supabase-user.service.js";

const DAILY_REWARD_XP = [50, 50, 75, 75, 100, 100, 200];
const STREAK_RESET_HOURS = 48;
const CLAIM_COOLDOWN_HOURS = 24;

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
    const existingStreak = await prisma.streak.findUnique({
        where: { userId }
    });

    const now = new Date();
    let currentStreak = existingStreak?.currentStreak || 0;

    if (existingStreak?.lastClaimedAt) {
        const lastClaim = new Date(existingStreak.lastClaimedAt);
        const hoursSinceLastClaim = (now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60);

        if (hoursSinceLastClaim < CLAIM_COOLDOWN_HOURS) {
            throw new Error("Already claimed today. Please wait before claiming again.");
        }

        if (hoursSinceLastClaim > STREAK_RESET_HOURS) {
            currentStreak = 0;
        }
    }

    const rewardXP = DAILY_REWARD_XP[currentStreak % DAILY_REWARD_XP.length] ?? DAILY_REWARD_XP[0];
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
                entityId: userId,
                details: {
                    xp: rewardXP,
                    coins: rewardCoins,
                    day: (currentStreak % DAILY_REWARD_XP.length) + 1
                }
            }
        });

        const updatedStreak = await tx.streak.upsert({
            where: { userId },
            update: {
                currentStreak: currentStreak + 1,
                lastClaimedAt: now
            },
            create: {
                userId,
                currentStreak: 1,
                lastClaimedAt: now
            }
        });

        return {
            xp: rewardXP,
            coins: rewardCoins,
            streak: {
                id: updatedStreak.id,
                userId: updatedStreak.userId,
                currentStreak: Number(updatedStreak.currentStreak || 0),
                lastClaimedAt: updatedStreak.lastClaimedAt,
                canClaim: false,
                hoursUntilNextClaim: CLAIM_COOLDOWN_HOURS
            }
        };
    });
};

export { updateUser, deleteUser, claimDailyRewards };

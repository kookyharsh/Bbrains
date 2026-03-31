import { z } from 'zod';
import {
    createAchievementRecord, getAllAchievements, getAchievementById,
    updateAchievementRecord, deleteAchievementRecord,
    getUserAchievements, unlockAchievement
} from './achievement.service.js';
import { sendSuccess, sendCreated, sendError } from '../../utils/response.js';
import { createAuditLog } from '../../utils/auditLog.js';

const achievementSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(255).optional(),
    icon: z.string().url().optional(),
    tier: z.number().int().min(1),
    rewardXP: z.number().int().min(0),
    rewardCoins: z.number().int().min(0)
});

// POST /achievements
export const createAchievement = async (req, res) => {
    try {
        const validated = achievementSchema.parse(req.body);
        const achievement = await createAchievementRecord(validated);
        await createAuditLog(req.user.id, 'SYSTEM', 'CREATE', 'Achievement', achievement.id);
        return sendCreated(res, achievement, 'Achievement created');
    } catch (error) {
        if (error.name === 'ZodError') return sendError(res, 'Validation failed', 400, error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
        return sendError(res, 'Failed to create achievement', 500);
    }
};

// GET /achievements
export const getAchievements = async (req, res) => {
    try {
        const achievements = await getAllAchievements();
        return sendSuccess(res, achievements);
    } catch (error) {
        return sendError(res, 'Failed to fetch achievements', 500);
    }
};

// GET /achievements/:id
export const getAchievement = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) return sendError(res, 'Invalid ID', 400);
        const achievement = await getAchievementById(id);
        if (!achievement) return sendError(res, 'Achievement not found', 404);
        return sendSuccess(res, achievement);
    } catch (error) {
        return sendError(res, 'Failed to fetch achievement', 500);
    }
};

// PUT /achievements/:id
export const updateAchievement = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) return sendError(res, 'Invalid ID', 400);
        const validated = achievementSchema.partial().parse(req.body);
        const achievement = await updateAchievementRecord(id, validated);
        await createAuditLog(req.user.id, 'SYSTEM', 'UPDATE', 'Achievement', id);
        return sendSuccess(res, achievement, 'Achievement updated');
    } catch (error) {
        if (error.code === 'P2025') return sendError(res, 'Achievement not found', 404);
        return sendError(res, 'Failed to update achievement', 500);
    }
};

// DELETE /achievements/:id
export const deleteAchievementHandler = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) return sendError(res, 'Invalid ID', 400);
        await deleteAchievementRecord(id);
        await createAuditLog(req.user.id, 'SYSTEM', 'DELETE', 'Achievement', id);
        return sendSuccess(res, null, 'Achievement deleted');
    } catch (error) {
        if (error.code === 'P2025') return sendError(res, 'Achievement not found', 404);
        return sendError(res, 'Failed to delete achievement', 500);
    }
};

// GET /achievements/me
export const getMyAchievements = async (req, res) => {
    try {
        const achievements = await getUserAchievements(req.user.id);
        return sendSuccess(res, achievements);
    } catch (error) {
        return sendError(res, 'Failed to fetch achievements', 500);
    }
};

// GET /achievements/user/:userId
export const getUserAchievementsList = async (req, res) => {
    try {
        const achievements = await getUserAchievements(req.params.userId);
        return sendSuccess(res, achievements);
    } catch (error) {
        return sendError(res, 'Failed to fetch achievements', 500);
    }
};

// POST /achievements/:id/unlock/:userId
export const manualUnlock = async (req, res) => {
    try {
        const achievementId = req.params.id;
        if (!achievementId) return sendError(res, 'Invalid ID', 400);
        const { userId } = req.params;
        const result = await unlockAchievement(userId, achievementId);
        await createAuditLog(req.user.id, 'SYSTEM', 'UNLOCK', 'Achievement', achievementId, { userId });
        return sendSuccess(res, result, 'Achievement unlocked');
    } catch (error) {
        if (error.code === 'P2002') return sendError(res, 'Achievement already unlocked', 409);
        return sendError(res, 'Failed to unlock achievement', 500);
    }
};

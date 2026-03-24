import { z } from 'zod';
import { getXpByUserId, awardXpToUser, getAllLevels, createLevel, updateLevel, deleteLevel } from './xp.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import { createAuditLog } from '../../utils/auditLog.js';

const awardSchema = z.object({
    userId: z.string().uuid(),
    amount: z.number().positive()
});

// GET /xp/me
export const getMyXp = async (req, res) => {
    try {
        const xp = await getXpByUserId(req.user.id);
        return sendSuccess(res, xp || { xp: 0, level: 1 });
    } catch (error) {
        return sendError(res, 'Failed to fetch XP', 500);
    }
};

// GET /xp/:userId
export const getUserXp = async (req, res) => {
    try {
        const xp = await getXpByUserId(req.params.userId);
        return sendSuccess(res, xp || { xp: 0, level: 1 });
    } catch (error) {
        return sendError(res, 'Failed to fetch XP', 500);
    }
};

// POST /xp/award
export const awardXp = async (req, res) => {
    try {
        const validated = awardSchema.parse(req.body);
        const xp = await awardXpToUser(validated.userId, validated.amount);
        await createAuditLog(req.user.id, 'SYSTEM', 'AWARD_XP', 'Xp', validated.userId, { amount: validated.amount });
        return sendSuccess(res, xp, 'XP awarded successfully');
    } catch (error) {
        if (error.name === 'ZodError') return sendError(res, 'Validation failed', 400, error.errors.map(e => ({ field: e.path.join('.'), message: e.message })));
        return sendError(res, 'Failed to award XP', 500);
    }
};

// GET /levels
export const getLevels = async (req, res) => {
    try {
        const levels = await getAllLevels();
        return sendSuccess(res, levels);
    } catch (error) {
        return sendError(res, 'Failed to fetch levels', 500);
    }
};

// Admin: create a new level threshold
export const adminCreateLevel = async (req, res) => {
  try {
    const schema = z.object({ levelNumber: z.number().int().positive(), requiredXp: z.number().positive() });
    const payload = schema.parse(req.body);
    const level = await createLevel(payload.levelNumber, payload.requiredXp);
    return sendSuccess(res, level, 'Level created');
  } catch (e) {
    if (e.name === 'ZodError') {
      return sendError(res, 'Validation failed', 400, e.errors);
    }
    return sendError(res, 'Failed to create level', 500);
  }
};

// Admin: update an existing level threshold by levelNumber
export const adminUpdateLevel = async (req, res) => {
  try {
    const levelNumber = parseInt(req.params.levelNumber, 10);
    const schema = z.object({ requiredXp: z.number().positive() });
    const payload = schema.parse(req.body);
    const updated = await updateLevel(levelNumber, payload.requiredXp);
    return sendSuccess(res, updated, 'Level updated');
  } catch (e) {
    if (e.name === 'ZodError') {
      return sendError(res, 'Validation failed', 400, e.errors);
    }
    return sendError(res, 'Failed to update level', 500);
  }
};

// Admin: delete a level by levelNumber
export const adminDeleteLevel = async (req, res) => {
  try {
    const levelNumber = parseInt(req.params.levelNumber, 10);
    const deleted = await deleteLevel(levelNumber);
    return sendSuccess(res, deleted, 'Level deleted');
  } catch (e) {
    return sendError(res, 'Failed to delete level', 500);
  }
};

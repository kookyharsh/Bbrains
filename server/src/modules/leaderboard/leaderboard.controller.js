import { getLeaderboard, getMyPosition, refreshLeaderboard } from './leaderboard.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

// GET /leaderboard
export const getLeaderboardHandler = async (req, res) => {
    try {
        const category = req.query.category || 'allTime';
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const offset = parseInt(req.query.offset) || 0;

        const leaderboard = await getLeaderboard(category, limit, offset);
        return sendSuccess(res, leaderboard);
    } catch (error) {
        return sendError(res, 'Failed to fetch leaderboard', 500);
    }
};

// GET /leaderboard/me
export const getMyLeaderboardPosition = async (req, res) => {
    try {
        const category = req.query.category || 'allTime';
        const position = await getMyPosition(req.user.id, category);
        return sendSuccess(res, position || { rank: null, message: 'Not on leaderboard yet' });
    } catch (error) {
        return sendError(res, 'Failed to fetch position', 500);
    }
};

// POST /leaderboard/refresh
export const refreshLeaderboardHandler = async (req, res) => {
    try {
        const category = req.query.category || 'allTime';
        const result = await refreshLeaderboard(category);
        return sendSuccess(res, result, 'Leaderboard refreshed');
    } catch (error) {
        console.error(error);
        return sendError(res, 'Failed to refresh leaderboard', 500);
    }
};

import { getLeaderboard, getMyPosition } from './leaderboard.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

// GET /leaderboard
export const getLeaderboardHandler = async (req, res) => {
    try {
        const sortBy = req.query.sortBy === 'points' ? 'points' : 'xp';
        const limit = Math.min(parseInt(req.query.limit) || 20, 100);
        const offset = parseInt(req.query.offset) || 0;

        const leaderboard = await getLeaderboard(sortBy, limit, offset);
        return sendSuccess(res, leaderboard);
    } catch (error) {
        return sendError(res, 'Failed to fetch leaderboard', 500);
    }
};

// GET /leaderboard/me
export const getMyLeaderboardPosition = async (req, res) => {
    try {
        const sortBy = req.query.sortBy === 'points' ? 'points' : 'xp';
        const position = await getMyPosition(req.user.id, sortBy);
        return sendSuccess(res, position || { rank: null, message: 'Not on leaderboard yet' });
    } catch (error) {
        return sendError(res, 'Failed to fetch position', 500);
    }
};

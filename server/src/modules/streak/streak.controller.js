import { getStreak, claimDailyPoints } from './streak.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export const getUserStreak = async (req, res) => {
    try {
        const streak = await getStreak(req.user.id);
        const now = new Date();

        let canClaim = true;
        let diffHours = 0;
        if (streak.lastClaimedAt) {
            const timeDiff = now.getTime() - streak.lastClaimedAt.getTime();
            diffHours = timeDiff / (1000 * 60 * 60);
            if (diffHours < 24) {
                canClaim = false;
            }
        }

        return sendSuccess(res, {
            ...streak,
            canClaim,
            hoursUntilNextClaim: canClaim ? 0 : Math.max(0, 24 - diffHours)
        });
    } catch (error) {
        console.error(error);
        return sendError(res, 'Failed to fetch streak', 500);
    }
};

export const claimPoints = async (req, res) => {
    try {
        const streak = await claimDailyPoints(req.user.id);
        return sendSuccess(res, streak, 'Successfully claimed daily points!');
    } catch (error) {
        if (error.message === 'Already claimed today. Please wait 24 hours.') {
            return sendError(res, error.message, 400);
        }
        console.error(error);
        return sendError(res, 'Failed to claim points', 500);
    }
};

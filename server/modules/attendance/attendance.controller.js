import { getAttendanceRecords } from './attendance.service.js';
import { sendSuccess, sendError } from '../../utils/response.js';

export const getAttendance = async (req, res) => {
    try {
        const userId = req.user.id;
        // Default to last 7 days if not provided
        const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
        const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

        const records = await getAttendanceRecords(userId, startDate, endDate);
        return sendSuccess(res, records);
    } catch (error) {
        console.error(error);
        return sendError(res, 'Failed to fetch attendance records', 500);
    }
};
